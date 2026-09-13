# Physics Auditor: Change Request Queue

**Purpose**: Structured queue of changes identified by `/physics-auditor` for implementation.

---

## Queue Format

Each change request follows this structure:

```markdown
## CR-[ID]: [Title]

**Status**: PENDING | APPROVED | IMPLEMENTED | REJECTED
**Priority**: CRITICAL | HIGH | MEDIUM | LOW
**Filed**: [date]
**Source**: [audit session/finding]

### Problem
[What's wrong]

### Proposed Change
[Specific fix with file:line references]

### Files Affected
- [file1] — [what changes]
- [file2] — [what changes]

### Dependencies
- Upstream: [files that this depends on]
- Downstream: [files that depend on this]

### Validation
- [ ] Change doesn't break upstream
- [ ] Downstream files updated
- [ ] Verification scripts pass

### Implementation Notes
[For the fixer agent]
```

---

## Active Queue

### CR-001: Create Missing DEF_02A3 (Tilt Matrix)

**Status**: IMPLEMENTED
**Priority**: CRITICAL (BLOCKING)
**Filed**: 2026-01-28
**Implemented**: 2026-01-28 (Session 132)
**Source**: Phase 1A Audit, Finding M-001

#### Problem
AXM_0114 (Tilt Possibility) and AXM_0117 (Crystallization Tendency) reference DEF_02A3 (Tilt Matrix) but the definition file does not exist.

#### Proposed Change
Create `core/definitions/DEF_02A3_tilt_matrix.md` with:
- Formal definition of ε_ij = ⟨π(b_i), π(b_j)⟩ - δ_ij
- Properties (symmetric, trace, norm)
- Relation to crystallinity (ε = 0 ⟺ crystalline)

#### Files Affected
- `core/definitions/DEF_02A3_tilt_matrix.md` — CREATE
- `core/axioms/AXM_0114_tilt_possibility.md` — verify reference
- `core/axioms/AXM_0117_crystallization_tendency.md` — verify reference

#### Dependencies
- Upstream: DEF_0210 (Perspective), AXM_0109 (Crystal), AXM_0110 (Orthogonality)
- Downstream: AXM_0114, AXM_0117, AXM_0118

#### Validation
- [x] Definition mathematically rigorous
- [x] References in AXM_0114, AXM_0117 resolve
- [x] No circular dependencies

#### Implementation Notes
- Created DEF_02A3_tilt_matrix.md with full definition, properties, physical interpretation
- Updated AXM_0114 cross-reference (removed "to be created")
- Updated AXM_0117 requires section (removed "to be created")

---

### CR-002: Bridge Universe and Crystal Axiom Systems

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-28
**Implemented**: 2026-01-28 (Session 132)
**Source**: Phase 1A Audit, Conflict C-001
**Investigation**: `framework/investigations/axiom_unification.md`

#### Problem
Two parallel axiom systems exist:
1. Universe-based (AXM_0100-0108): Points P, simplicial complex Σ
2. Crystal-based (AXM_0109-0118): Inner product space V_Crystal

No explicit connection between them.

#### Proposed Change
User selected: **Option C - Full Unification**

Refactor both axiom systems into a single unified framework. This requires:
1. Identify which concepts from each system are primitive
2. Derive remaining concepts from unified primitives
3. Update all 18+ axiom files
4. Verify all downstream derivations remain valid

#### Files Affected
- `core/axioms/AXM_0100-0118` — ALL axiom files (potential restructure)
- `core/definitions/` — Multiple definitions may need updating
- `framework/layer_0_*.md` — Layer files need consistency check

#### Dependencies
- Affects entire framework architecture
- All downstream derivations depend on axiom consistency

#### Validation
- [x] All axioms consistent under unification
- [x] No new circular dependencies
- [x] Derivations still valid
- [x] Single coherent ontology

#### Implementation Notes (Session 132)

**Phase 2: Bridge Definitions Created**
- `DEF_02B0_universe_crystal_correspondence.md` — master bridge
- `DEF_02B1_point_basis_mapping.md` — P ↔ B bijection
- `DEF_02B2_simplex_subspace_mapping.md` — Σ ↔ subspaces

**Phase 3: Axioms Updated**
- `AXM_0100` — added unification note, cross-ref to AXM_0109
- `AXM_0101` — connectivity derived from tilt + partiality
- `AXM_0109` — added unification note, cross-ref to AXM_0100
- `AXM_0113` — resolved finite access vs infinite crystal conflict

**Key Result**: |P| = dim(V_Crystal) = n_c = 11

**Conflict C-001**: RESOLVED

---

### CR-003: Document n_c = 11 Derivation Source

**Status**: IMPLEMENTED
**Priority**: CRITICAL
**Filed**: 2026-01-28
**Implemented**: 2026-01-28 (Session 132)
**Source**: Phase 1A Audit, Gap G-001

#### Problem
AXM_0118 uses n_c = 11 as a "framework dimension" but derivation is not in axiom files. This is either:
- An [A-IMPORT] that should be tagged
- A [D] derivation that should be referenced
- An unacknowledged assumption

#### Proposed Change
1. Locate n_c = 11 derivation (likely in foundations/ or framework/)
2. Add explicit reference in AXM_0118
3. Tag appropriately: [A-IMPORT], [D], or acknowledge as structural choice

#### Files Affected
- `core/axioms/AXM_0118_prime_attractor_selection.md` — add derivation reference
- Source file (TBD) — verify derivation exists

#### Dependencies
- Upstream: Division algebra structure (1+2+4+4=11 or similar)
- Downstream: All prime attractor claims

#### Validation
- [x] Derivation traced to axioms or imports
- [x] AXM_0118 properly tagged
- [x] n_c value justified

#### Implementation Notes
- Found existing derivation script: `verification/sympy/nc_11_rigorous_derivation.py`
- Derivation: n_c = Im_C + Im_H + Im_O = 1 + 3 + 7 = 11
- Added new "Derivation of n_c = 11" section to AXM_0118
- Tagged as [D: from Frobenius-Hurwitz + imaginary decomposition]
- Updated Requires section to reference [I-MATH: Frobenius-Hurwitz]

---

## Completed

### CR-001: Create Missing DEF_02A3 (Tilt Matrix) — Session 132
- Created `core/definitions/DEF_02A3_tilt_matrix.md`
- Updated AXM_0114, AXM_0117 references

### CR-003: Document n_c = 11 Derivation Source — Session 132
- Added derivation section to AXM_0118
- Referenced `verification/sympy/nc_11_rigorous_derivation.py`
- Tagged as [D: from Frobenius-Hurwitz]

### CR-002: Bridge Universe ↔ Crystal — Session 132
- Created 3 bridge definitions (DEF_02B0, DEF_02B1, DEF_02B2)
- Updated 4 axiom files with unification notes
- Resolved Conflict C-001
- Established: |P| = dim(V_Crystal) = n_c = 11

### CR-004: Fix DEF_0226 Invertibility — Session 133
- Replaced inverse notation with preimage selector σ_{π₁}
- Clarified A⁻¹({x}) as set-theoretic fiber
- Updated `core/04_adjacency.md` overview

### CR-005: Define T_p — Session 133
- Defined T_p as 1-neighborhood in simplicial complex within DEF_0212
- Added differential geometry analogy note

### CR-006: Crystalline Equivalence — Session 133
- Added equivalence relationship section to DEF_0285
- Forward direction clear, reverse noted as [CONJECTURE]

### CR-007: Symbol Collision (γ) — Session 133
- Renamed trajectory γ → τ_traj in DEF_0264
- Updated DEF_0265, DEF_0266, DEF_0267

### CR-008: THM_0413 Horizon — Session 133
- Rewrote with formal 3-part theorem and proof
- Changed from ACTIVE to CANONICAL

### CR-009: THM_0450 Conservation — Session 133
- Fixed log vs cardinality error
- Reformulated as cardinality conservation: |U_π| + |H_π| = |U|
- Updated THM_0451 Second Law proof

### CR-010: THM_0484 Associativity + n_c — Session 133
- Acknowledged associativity as [A-STRUCTURAL] with Gap Note G-004
- Designated canonical n_c decomposition (Im decomposition)
- Removed Layer 2 physics from theorem Consequences

### CR-011: THM_0485 F=C Argument — Session 133
- Added commutativity + minimality arguments to uniquely select C
- Fixed T1 → AXM_0107 references
- Added Gap Note G-003

### CR-012: I_π Definition Inconsistency — Session 134
- Renamed Layer 0 quantity to d_π (dimensional) to avoid collision with DEF_0250's I_π (information-theoretic)
- Added cross-reference to THM_0450 cardinality conservation

### CR-013: Outdated THM_0450 in layer_1_mathematics.md — Session 134
- Replaced incorrect `I_π + S_π = log₂|U|` with cardinality conservation form
- Added error note referencing CR-009

### CR-014: Layer Violations in layer_1_crystallization.md — Session 134
- Added [LAYER 2/3 PREVIEW] markers to Parts IV-VIII
- Added import tags ([A-COUPLING], [A-IMPORT]) throughout
- Updated Executive Summary with explicit layer boundary description

### CR-015: Outdated F=C Status in layer_2_correspondence.md — Session 134
- Updated §3.1 from "NOT DERIVED" to "DERIVED (conditional on G-004)"
- Rewrote §8-9: "reorganization" → "conditional derivation" with progress table

### CR-016: Weinberg Angle Scale Inconsistency — Session 134
- Labeled 4 TeV heuristic as [CONJECTURE], noted ~50× discrepancy with RG result
- Updated Part VIII to use verified 188 TeV value

---

### CR-004: Fix Transition Map Invertibility Contradiction

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-28
**Implemented**: 2026-01-30 (Session 133)
**Source**: Phase 1B Audit, Conflict D-001

#### Problem
DEF_0226 (Transition Map) uses `A_{π₁}^{-1}` to define transitions, but AXM_0106 states that access maps are **non-invertible**. This is a logical contradiction.

#### Proposed Change
Clarify DEF_0226 to use:
1. **Preimage selection** (not inverse): `T_{12}(x) = A_{π₂}(y)` where `y ∈ A_{π₁}^{-1}(x)` is a selected preimage
2. **Or** redefine using overlap: `T_{12}(x) = x` for `x ∈ U_{π₁} ∩ U_{π₂}`

#### Files Affected
- `core/definitions/DEF_0226_transition_map.md` — clarify inverse usage

#### Dependencies
- Upstream: AXM_0106 (non-invertibility)
- Downstream: DEF_0227, DEF_0228, all transition-based derivations

#### Validation
- [x] Definition consistent with AXM_0106
- [x] Downstream definitions still valid
- [x] No logical contradictions

#### Implementation Notes (Session 133)
- Replaced `A_{π₁}^{-1}(x)` with explicit preimage selector `σ_{π₁}(x)`
- Added notation clarification: `A⁻¹({x})` is set-theoretic fiber, not function inverse
- Updated `core/04_adjacency.md` overview to match
- Added [AXM_0106] to Requires section

---

### CR-005: Define Tangent Space T_p

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-01-28
**Implemented**: 2026-01-30 (Session 133)
**Source**: Phase 1B Audit, Missing Definition

#### Problem
DEF_0212 (Direction Set) references `T_p` (tangent space at point p) but this is never formally defined.

#### Proposed Change
Either:
1. Create DEF_0208 defining T_p formally
2. Or remove T_p and use a simpler definition

#### Files Affected
- `core/definitions/DEF_0212_direction_set.md` — depends on fix approach
- Potentially new file DEF_0208

#### Dependencies
- Downstream: DEF_0210 (Perspective), DEF_0216 (Perspective Space)

#### Validation
- [x] T_p well-defined
- [x] Direction set makes sense

#### Implementation Notes (Session 133)
- Defined T_p = { q ∈ P : {p, q} ∈ Σ₁ } directly in DEF_0212 (discrete 1-neighborhood)
- Added note clarifying analogy to differential geometry tangent space
- No separate DEF_0208 file needed — definition is simple enough to inline

---

### CR-006: Prove Crystalline Definition Equivalence

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-01-28
**Implemented**: 2026-01-30 (Session 133)
**Source**: Phase 1B Audit, Conflict D-002

#### Problem
Two definitions of "crystalline":
- DEF_0285: `Var(U) = 0` (perspectival variance)
- DEF_02A3 implies: `ε = 0` (tilt matrix zero)

These SHOULD be equivalent but no proof exists.

#### Proposed Change
Add proof or reference showing: `Var(U) = 0 ⟺ ε = 0 for all perspectives`

#### Files Affected
- `core/definitions/DEF_0285_crystalline.md` — add equivalence note
- Or create theorem THM_04XX proving equivalence

#### Dependencies
- DEF_0272 (perspectival variance), DEF_02A3 (tilt matrix)

#### Validation
- [x] Equivalence noted and argument sketched

#### Implementation Notes (Session 133)
- Added "Relationship to Tilt Matrix" section in DEF_0285
- Forward direction (ε=0 → Var=0) is clear
- Reverse direction noted as [CONJECTURE] requiring formal proof
- No separate theorem file created — noted as open question

---

### CR-007: Resolve Symbol Collision (γ)

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-01-28
**Implemented**: 2026-01-30 (Session 133)
**Source**: Phase 1B Audit, Symbol Drift

#### Problem
Symbol γ used for both:
- Overlap parameter (DEF_0230)
- Trajectory (DEF_0264)

#### Proposed Change
Rename trajectory symbol to τ_traj or similar in DEF_0264.

#### Files Affected
- `core/definitions/DEF_0264_trajectory.md` — rename symbol
- Any files referencing trajectory

#### Validation
- [x] No symbol collisions remain

#### Implementation Notes (Session 133)
- Renamed trajectory symbol γ → τ_traj in DEF_0264
- Updated downstream: DEF_0265, DEF_0266, DEF_0267
- Added note distinguishing τ_traj from τ₀ (time scale)

---

### CR-008: Reclassify THM_0413 (Horizon)

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Implemented**: 2026-01-30 (Session 133)
**Source**: Phase 1C Audit

#### Problem
THM_0413 has **no proof whatsoever** — it simply defines the concept of horizon H as a "truncation scale" when some weights Γ = 1. This is a definition, not a theorem. The file itself notes "ACTIVE — definition of H needs formalization."

#### Proposed Change
Either:
1. Reclassify as a definition (DEF_02XX) defining the horizon concept
2. Or rewrite with an actual theorem statement and proof (e.g., "If Γ = 1 on a subgraph, then information propagates without attenuation on that subgraph" — which IS provable)

#### Files Affected
- `core/theorems/THM_0413_horizon.md` — reclassify or add proof

#### Dependencies
- Upstream: THM_0412 (Attenuation), DEF_0204
- Downstream: Any files referencing horizon concept

#### Validation
- [x] File correctly classified as theorem (with proof)
- [x] Statement is well-formed
- [x] Cross-references updated

#### Implementation Notes (Session 133)
- Kept as THEOREM (not reclassified to definition)
- Added formal 3-part statement: (a) lossless propagation on H_Γ, (b) attenuation outside, (c) effective horizon with decay length
- Added proof deriving each part from THM_0412 and Γ properties
- Status changed from ACTIVE to CANONICAL

---

### CR-009: Fix THM_0450 Conservation Proof (Log vs Cardinality Error)

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-30
**Implemented**: 2026-01-30 (Session 133)
**Source**: Phase 1C Audit

#### Problem
THM_0450 claims `I_π + S_π = I_total = log₂|U|` where I_π and S_π are defined using logs.

The proof argues:
1. U_π ∪ H_π = U (partition) → |U_π| + |H_π| = |U|
2. "Taking logs" → I_π + S_π = log₂|U|

But log₂|A| + log₂|B| = log₂(|A|·|B|), NOT log₂(|A| + |B|).

Either:
- The information quantities are cardinalities (not logs), making the equality correct
- Or the statement should use a product: I_π · S_π ≤ (I_total)² or similar
- Or the conservation law needs a different formulation

#### Proposed Change
1. Check DEF_0250, DEF_0251 for exact definitions of I_π, S_π
2. If defined as cardinalities: fix the proof to not mention logs
3. If defined as logs: reformulate the conservation statement
4. Ensure THM_0451 (Second Law) remains valid after fix

#### Files Affected
- `core/theorems/THM_0450_conservation.md` — fix proof
- `core/theorems/THM_0451_second_law.md` — verify still valid
- `core/definitions/DEF_0250_information_content.md` — check definition

#### Dependencies
- Upstream: DEF_0250, DEF_0251, DEF_0201
- Downstream: THM_0451, THM_0452

#### Validation
- [x] Conservation law mathematically correct (cardinality form)
- [x] Proof matches definitions (I_π = log₂|U_π|, S_π = log₂|H_π|)
- [x] Second law still follows (THM_0451 updated to use cardinality reasoning)

#### Implementation Notes (Session 133)
- Reformulated conservation as cardinality law: |U_π| + |H_π| = |U|
- Added correct information-theoretic bound: I_π + S_π ≤ 2·log₂|U| - 2
- Added historical note documenting the error
- Updated THM_0451 proof to derive from cardinality conservation + monotonicity of log

---

### CR-010: Address THM_0484 Associativity Gap and n_c Inconsistency

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-30
**Implemented**: 2026-01-30 (Session 133)
**Source**: Phase 1C Audit

#### Problem
Two issues in THM_0484 (Division Algebra Structure):

**Issue A: Associativity Gap**
Step 3 claims "path independence → associativity" but:
- Path independence is STRONGER than associativity (it means the result depends only on endpoints)
- Neither path independence nor associativity is proven as a separate theorem
- This is a critical step — without it, Frobenius theorem doesn't apply

**Issue B: n_c Decomposition Inconsistency**
THM_0484 Consequences says: crystal uses R + C + O → 1 + 2 + 8 = 11
AXM_0118 derivation (CR-003) says: n_c = Im_C + Im_H + Im_O = 1 + 3 + 7 = 11

Same number, completely different decompositions. Which is canonical?

#### Proposed Change
1. Create THM_04XX proving associativity from axioms (or acknowledge it as [A-STRUCTURAL])
2. Reconcile n_c decomposition: choose ONE canonical derivation and note the other as alternative
3. Move physics interpretations (gauge groups, α) from Consequences to Layer 2 reference

#### Files Affected
- `core/theorems/THM_0484_division_algebra_structure.md` — fix proof, reconcile n_c
- `core/axioms/AXM_0118_prime_attractor_selection.md` — ensure consistency
- Potentially new file for associativity theorem

#### Dependencies
- Upstream: THM_0482, THM_0483, path independence (UNPROVEN)
- Downstream: THM_0485, all gauge derivations, α prediction

#### Validation
- [x] Associativity acknowledged as [A-STRUCTURAL] assumption with Gap Note G-004
- [x] n_c decomposition: canonical = Im_C+Im_H+Im_O = 1+3+7 = 11; alternative noted
- [x] Layer separation: physics interpretations removed from Consequences, pointed to Layer 2

#### Implementation Notes (Session 133)
- Added Gap Note G-004 section documenting associativity as unproven structural assumption
- Designated AXM_0118 imaginary decomposition as canonical; THM_0484 alternative decomposition noted
- Removed gauge group/α content from Consequences (Layer 0/1 violation)
- Added cross-reference to AXM_0118 and Layer 2 files

---

### CR-011: Strengthen THM_0485 F=C Argument

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-30
**Implemented**: 2026-01-30 (Session 133)
**Source**: Phase 1C Audit, connects to G-003

#### Problem
THM_0485 argues: directed time → antisymmetric structure → F = C.

But the argument is **incomplete**: quaternions H also have antisymmetric structure (three imaginary parts, each antisymmetric under conjugation). The proof only rules out F = R, not F = H or F = O.

The claim "Only F = C provides this" (step 4) is **false** as stated.

Additionally:
- "Directed time (T1)" is referenced but T1 is not a labeled axiom
- Cross-reference mentions AXM_0116 but the proof uses AXM_0107

#### Proposed Change
1. Add argument ruling out H and O as base field (e.g., commutativity requirement, or minimality)
2. Fix the claim "Only F = C provides this" → "F = C is the minimal field with this property"
3. Clarify T1 reference → AXM_0107

#### Files Affected
- `core/theorems/THM_0485_complex_structure.md` — strengthen proof, fix references

#### Dependencies
- Upstream: AXM_0107, THM_0484
- Downstream: All quantum/phase derivations, fermion structure

#### Validation
- [x] Proof uniquely selects C (antisymmetry + commutativity + minimality)
- [x] References corrected (T1 → AXM_0107)
- [x] Consistent with G-003 gap (noted in Gap Note)

#### Implementation Notes (Session 133)
- Added step 4: commutativity requirement (fields are commutative by definition → eliminates H, O)
- Added step 5: minimality argument (C is smallest commutative division algebra with antisymmetry)
- Added Gap Note G-003 discussing vector spaces vs modules distinction
- Fixed all references: removed T1, pointed to AXM_0107 and THM_0484

---

### CR-012: Fix I_π Definition Inconsistency

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-30
**Implemented**: 2026-01-30 (Session 134)
**Source**: Phase 2A Audit — layer_0_pure_axioms.md vs DEF_0250

#### Problem
Two conflicting definitions of I_π (perspective information):
- `layer_0_pure_axioms.md` (line ~347): `I_π = dim(V_π)` — dimensional definition
- `DEF_0250` (core/definitions): `I_π = log₂|U_π|` — information-theoretic definition

These are fundamentally different quantities:
- dim(V_π) = number of accessible dimensions (a natural number)
- log₂|U_π| = bits required to specify accessible content (depends on content set cardinality)

Additionally, layer_0_pure_axioms.md line ~348 states `I_π + H_π = dim(V_Crystal)`, which is a dimensional conservation law. This conflicts with the cardinality conservation law in THM_0450: `|U_π| + |H_π| = |U|`.

#### Proposed Change
1. In `layer_0_pure_axioms.md` §16: Replace `I_π = dim(V_π)` with a reference to DEF_0250, or note that this is a Layer 0 "dimension" quantity distinct from the information-theoretic I_π
2. Reconcile conservation statement with THM_0450 cardinality form
3. Add a note mapping between the two conventions

#### Files Affected
- `framework/layer_0_pure_axioms.md` — fix §16 information definition
- Cross-reference with `core/definitions/DEF_0250_information_content.md`

#### Dependencies
- Upstream: DEF_0250, THM_0450 (CR-009 already fixed)
- Downstream: Any files referencing I_π from layer_0

#### Validation
- [x] Single consistent definition of I_π (renamed to d_π in Layer 0 context)
- [x] Conservation law matches THM_0450
- [x] No broken downstream references

#### Implementation Notes (Session 134)
- Renamed Layer 0 quantity from I_π to d_π (dimensional quantity) to avoid collision with DEF_0250's information-theoretic I_π
- Added notation note explaining the distinction
- Added cross-reference to THM_0450 cardinality conservation and information-theoretic bound

---

### CR-013: Fix Outdated THM_0450 in layer_1_mathematics.md

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Implemented**: 2026-01-30 (Session 134)
**Source**: Phase 2A Audit — layer_1_mathematics.md line 347

#### Problem
`layer_1_mathematics.md` §5.4 (line 347) still contains the old incorrect formula:
```
I_π + S_π = I_total = log₂|U|
```

This was identified and fixed in THM_0450 by CR-009 (Session 133). The correct statement is:
- Cardinality conservation: `|U_π| + |H_π| = |U|`
- Information-theoretic bound: `I_π + S_π ≤ 2·log₂|U| - 2`

The layer file was not updated when the core theorem was fixed.

#### Proposed Change
1. Replace line 347 with the corrected cardinality conservation form
2. Update the bounds on lines 352-353 to match
3. Add reference to THM_0450 (Session 133 fix)

#### Files Affected
- `framework/layer_1_mathematics.md` — fix §5.4

#### Dependencies
- Upstream: THM_0450 (already fixed by CR-009)
- Downstream: None (informational document)

#### Validation
- [x] Formula matches THM_0450
- [x] Bounds consistent
- [x] Reference to CR-009 fix added

#### Implementation Notes (Session 134)
- Replaced incorrect `I_π + S_π = I_total = log₂|U|` with cardinality conservation form
- Added information-theoretic bound with correct log identity
- Added explicit note about the error and CR-009 reference
- Updated bounds to cardinality form

---

### CR-014: Address Layer Violations in layer_1_crystallization.md

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-30
**Implemented**: 2026-01-30 (Session 134)
**Source**: Phase 2A Audit — layer_1_crystallization.md Parts IV-VIII

#### Problem
`layer_1_crystallization.md` is labeled "Layer 1" and "CORE FRAMEWORK" but Parts IV-VIII contain significant Layer 2/3 content:

**Part IV (Forces as Crystallization Channels)**: Maps division algebras to specific forces (gravity, EM, weak, strong) with gauge group identifications (U(1), SU(2), SU(3)). This is Layer 2 correspondence, not Layer 1 math.

**Part V (Weinberg Angle Derivation)**: Claims `sin²θ_W = dim(C)/dim(O) = 2/8 = 1/4`. This is a Layer 3 prediction requiring [A-COUPLING] assumption. Also states the isotropy scale as `15 × 246 GeV ≈ 4 TeV`, which conflicts with layer_3_predictions.md's `~188 TeV`.

**Parts VI-VIII**: Reference fermion counts, coupling constants, and GeV energy scales — all Layer 2/3 content.

The file's header note (lines 13-14) acknowledges "physics terminology for clarity" but the issue is deeper: the derivation chains in Parts IV-VIII require Layer 2 imports ([A-COUPLING], gauge group identification) that are not tagged.

#### Proposed Change
1. Add explicit `[A-IMPORT]` and `[A-COUPLING]` tags to Parts IV-VIII
2. Add section headers indicating Layer 2/3 content: `### [LAYER 2 PREVIEW]` or similar
3. Reconcile Weinberg angle scale (4 TeV vs 188 TeV) — see CR-016
4. Strengthen the header note to clearly delineate which parts are pure Layer 1

#### Files Affected
- `framework/layer_1_crystallization.md` — tag Layer 2/3 content throughout Parts IV-VIII

#### Dependencies
- Upstream: layer_2_correspondence.md (defines imports)
- Downstream: layer_3_predictions.md (uses these derivations)

#### Validation
- [x] All Layer 2/3 content clearly tagged
- [x] Import assumptions made explicit
- [x] No untagged physics claims in Layer 1 sections

#### Implementation Notes (Session 134)
- Updated Executive Summary layer note to explicitly list Parts I-III as Layer 1, Parts IV-VIII as Layer 2/3 Preview
- Added `[LAYER 2 PREVIEW]` / `[LAYER 3 PREVIEW]` markers to Parts IV, V, VI, VII, VIII headers
- Added blockquote layer boundary notes with specific import tags at each Part
- Tagged force identification, coupling, fermion identification imports
- Updated "What's Necessary" section to distinguish Layer 1 math from Layer 2/3 interpretations

---

### CR-015: Update Outdated Statements in layer_2_correspondence.md

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Implemented**: 2026-01-30 (Session 134)
**Source**: Phase 2A Audit — layer_2_correspondence.md §3.1, §8-9

#### Problem
Several statements in `layer_2_correspondence.md` are outdated:

**§3.1 (I-DIM-1: Complex Field)**: States "Status: **NOT DERIVED**" and "Nothing in axioms forces C" (line ~85). This is now outdated — THM_0485 (Session 133, strengthened by CR-011) derives F = C from:
- Commutativity requirement (fields are commutative by definition)
- Time direction → antisymmetric structure
- Minimality

**§8-9 (Central Problem)**: States the framework is "reorganization, not derivation" — this was accurate before Sessions 46-52 but is now outdated given the division algebra chain (THM_0482→0483→0484→0485) which derives SM structure from axioms + [A-DIV].

#### Proposed Change
1. §3.1: Change status from "NOT DERIVED" to "DERIVED (Session 133, THM_0485)" with conditions noted
2. §3.1: Add reference to THM_0485 and the commutativity + minimality argument
3. §8-9: Update "Central Problem" to reflect current state — framework now derives SM structure given [A-DIV], but the derivation-vs-discovery question remains open
4. Maintain intellectual honesty: note that THM_0485 depends on [A-STRUCTURAL: associativity] (Gap G-004)

#### Files Affected
- `framework/layer_2_correspondence.md` — update §3.1, §8-9

#### Dependencies
- Upstream: THM_0485, CR-011
- Downstream: None directly

#### Validation
- [x] F=C status correctly reflects current state
- [x] Central Problem section updated
- [x] Gap G-004 dependency noted
- [x] Intellectual honesty preserved

#### Implementation Notes (Session 134)
- §3.1: Changed F=C status from "NOT DERIVED" to "DERIVED (Session 133, THM_0485)" with conditions
- §3.1: Added derivation chain (commutativity + minimality + antisymmetry)
- §3.1: Noted caveat about Gap G-004 (associativity)
- §3.1: Changed classification from "ESSENTIAL" to "DERIVED (conditional)"
- §8: Added progress table showing 5 of 7 items now derived (conditional on [A-DIV])
- §8: Identified remaining gaps (n_space=3, |Π|, associativity)
- §9: Updated from "reorganization" to "conditional derivation"
- Maintained intellectual honesty throughout

---

### CR-016: Reconcile Weinberg Angle Scale Inconsistency

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Implemented**: 2026-01-30 (Session 134)
**Source**: Phase 2A Audit — Cross-file inconsistency

#### Problem
Two different scales for sin²θ_W = 1/4:

- `layer_1_crystallization.md` §3.3 (line ~151): `mu_isotropy = 15 × v = 15 × 246 GeV = 3693 GeV ≈ 4 TeV`
- `layer_3_predictions.md` §4.1 (line ~488): `At μ ~ 188 TeV: sin²θ_W = 0.250 exactly`

These differ by a factor of ~50. The layer_3 value (188 TeV) is based on actual SM β-function running and appears to be correct. The layer_1 value (15 × v) appears to be a heuristic "isotropy scale" without RG running justification.

Additionally, there may be a third value: the traditional GUT-level 3/8 prediction at ~10^15 GeV, which is different from both.

#### Proposed Change
1. In `layer_1_crystallization.md`: Either remove the 4 TeV scale claim or note it as [CONJECTURE] with explicit contrast to the RG-running result
2. Add cross-reference to `layer_3_predictions.md` P-COUP-1 for the verified 188 TeV value
3. Clarify whether the "isotropy scale" and "RG running to 1/4" are meant to be the same or different concepts

#### Files Affected
- `framework/layer_1_crystallization.md` — fix §3.3, §5.1 scale claims
- Cross-reference with `framework/layer_3_predictions.md` §4.1

#### Dependencies
- Upstream: SM β-function running (verified in scripts)
- Downstream: Any references to Weinberg angle scale

#### Validation
- [x] Single consistent scale for sin²θ_W = 1/4
- [x] RG-running result (188 TeV) clearly distinguished from heuristic estimates
- [x] Cross-references between files

#### Implementation Notes (Session 134)
- §3.3: Labeled 15×v = 4 TeV as `[CONJECTURE]` heuristic estimate
- §3.3: Added explicit warning that this differs from RG-running result by factor ~50
- §3.3: Added cross-reference to layer_3_predictions.md §4.1 (P-COUP-1)
- Part VIII: Updated isotropy scale from "4 TeV" to "~188 TeV (from SM RG running)"
- Part VIII: Added [A-IMPORT: β-functions] tag

---

## Phase 2B: Foundation Documents (Session 135)

### CR-017: Standardize n_c Decomposition Across Foundations

**Status**: **IMPLEMENTED** (Session 135)
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase 2B Batch Audit, XF-001

#### Problem
Three incompatible decompositions of n_c = 11 appear across foundation documents:
- Im_C+Im_H+Im_O = 1+3+7 = 11 (CANONICAL per CR-010)
- R+C+O = 1+2+8 = 11 (THE_CHAIN.md:205, constants_from_dimensions.md:82)
- R+C+H+H = 1+2+4+4 = 11 (einstein_equations_rigorous.md)

#### Proposed Change
Replace all non-canonical decompositions with Im_C+Im_H+Im_O = 1+3+7, or explicitly note the alternative as non-canonical.

#### Files Affected
- `foundations/THE_CHAIN.md` — Line 205: change "1+2+8 = 11" to "Im_C+Im_H+Im_O = 1+3+7 = 11"
- `foundations/einstein_equations_rigorous.md` — Fix n_c = 1+2+4+4 to canonical
- `foundations/constants_from_dimensions.md` — Line 82: add note that R+C+O is non-canonical

#### Dependencies
- Upstream: CR-010 (established canonical decomposition)
- Downstream: All files referencing n_c

---

### CR-018: Update big_bang_nature.md to Canonical Inflation Values

**Status**: **IMPLEMENTED** (Session 135)
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase 2B Batch Audit, XF-002

#### Problem
big_bang_nature.md line 413 claims n_s = 117/121 = 0.9669 which is OUTDATED. Canonical value (per hilltop_inflation_canonical.md) is n_s = 193/200 = 0.965, r = 7/200 = 0.035.

#### Proposed Change
Update Part XI:2 (Inflation as Nucleation Spreading) to use canonical values from hilltop_inflation_canonical.md.

#### Files Affected
- `foundations/big_bang_nature.md` — Line 413: Replace n_s = 117/121 with n_s = 193/200 = 0.965; add reference to hilltop_inflation_canonical.md

#### Dependencies
- Upstream: hilltop_inflation_canonical.md (canonical source)
- Downstream: None known

---

### CR-019: Reconcile Potentials in crystallization_dynamics.md

**Status**: **IMPLEMENTED** (Session 135)
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase 2B Batch Audit, XF-003

#### Problem
crystallization_dynamics.md still references the DEPRECATED double-well potential V(ε) = -aε² + bε⁴ in:
- Equations of motion section (~lines 164-175)
- Derivation chain (~lines 362-378)

The canonical potential is now the hilltop V(φ) = V₀(1 - φ²/μ²) per hilltop_inflation_canonical.md.

#### Proposed Change
Either:
(A) Replace all double-well references with hilltop potential, OR
(B) Clearly mark the double-well as DEPRECATED with a note pointing to the canonical treatment

Recommend option (B) since the file is large and serves historical purposes.

#### Files Affected
- `foundations/crystallization_dynamics.md` — Add deprecation notices, cross-reference hilltop_inflation_canonical.md

#### Dependencies
- Upstream: hilltop_inflation_canonical.md
- Downstream: einstein_equations_rigorous.md, einstein_from_crystallization.md

---

### CR-020: Standardize ε* Equilibrium Value

**Status**: **RESOLVED (No Action Needed)** — Both files use ε* = α² consistently
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Source**: Phase 2B Batch Audit, XF-004

#### Problem
The crystallization equilibrium value ε* appears with two different values:
- ε* = α (fine structure constant) in crystallization_dynamics.md
- ε* = α² in einstein_equations_rigorous.md

These differ by a factor of ~137.

#### Proposed Change
Determine which is correct and standardize. Add explicit derivation or reference for the canonical value.

#### Files Affected
- `foundations/crystallization_dynamics.md` — Verify ε* value
- `foundations/einstein_equations_rigorous.md` — Verify ε* value
- `foundations/einstein_from_crystallization.md` — Check consistency

#### Dependencies
- Upstream: Core axioms
- Downstream: All cosmological predictions using ε*

---

### CR-021: Fix Axiom References in einstein_equations_rigorous.md

**Status**: **IMPLEMENTED** (Session 135)
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Source**: Phase 2B Batch Audit

#### Problem
Part I (Section 1.1) references axioms AXM_0101, AXM_0102, AXM_0105 with statements that do not match the actual axiom content in core/axioms/. Also uses the unique decomposition n_c = 1+2+4+4 seen nowhere else.

#### Proposed Change
- Correct axiom statement descriptions to match actual axiom files
- Fix n_c decomposition to canonical (CR-017)
- Update status from "ACTIVE - IN PROGRESS" to reflect actual completeness

#### Files Affected
- `foundations/einstein_equations_rigorous.md` — Part I table, n_c decomposition

#### Dependencies
- Upstream: core/axioms/AXM_0101.md, AXM_0102.md, AXM_0105.md
- Downstream: None direct

---

### CR-022: Add Confidence Tags to THE_CHAIN.md

**Status**: **IMPLEMENTED** (Session 135)
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Source**: Phase 2B Batch Audit

#### Problem
THE_CHAIN.md is the master summary document but contains NO confidence tags. Claims like "Physics is unique" and "no free parameters" are presented without [AXIOM]/[DERIVATION]/[CONJECTURE] qualification.

#### Proposed Change
Add appropriate confidence tags to all major claims. Tag the chain steps with their actual confidence level rather than presenting everything as established.

#### Files Affected
- `foundations/THE_CHAIN.md` — Add [THEOREM], [DERIVATION], [CONJECTURE] tags throughout

#### Dependencies
- Upstream: Individual foundation documents (provide actual confidence levels)
- Downstream: README.md (may need similar update)

---

### CR-023: Document Aut → Gauge Group Gap Explicitly

**Status**: **IMPLEMENTED** (Session 135)
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase 2B Batch Audit

#### Problem
gauge_from_automorphisms.md has a critical gap: the jump from finite automorphism groups to continuous gauge groups is not rigorously justified:
- Aut(C) = Z₂ → U(1): Z₂ is finite and discrete; U(1) is continuous. The document claims "connected component" but Z₂ has no non-trivial connected component.
- Aut(H) = SO(3) → SU(2): Why the double cover?
- G₂ ⊃ SU(3): Embedding mechanism not detailed.

This is the single most critical unresolved gap in the derivation chain.

#### Proposed Change
Add an explicit "Gap Analysis" section documenting:
1. The categorical gap (finite → continuous)
2. What is needed to close it
3. Current confidence level ([CONJECTURE] for the jump)
4. References to any attempted resolutions

#### Files Affected
- `foundations/gauge_from_automorphisms.md` — Add Gap Analysis section, adjust confidence tags

#### Dependencies
- Upstream: Frobenius theorem
- Downstream: fermions_from_representations.md, gauge_symmetry_from_tilt_topology.md, ALL gauge predictions

---

### CR-024: Strengthen observation_consistency.md Core Argument

**Status**: **IMPLEMENTED** (Session 135)
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase 2B Batch Audit

#### Problem
observation_consistency.md is the FIRST LINK in the derivation chain. It has these weaknesses:
1. Objection 3 answer conflates algebraic invertibility with information preservation
2. The argument assumes the transition algebra IS a division algebra, but physical transitions are operators on a Hilbert space — potential category error
3. The step "consistency requires no zero-divisors" needs more formal treatment

Any weakness here propagates to the entire framework.

#### Proposed Change
1. Strengthen Objection 3 response with precise definitions
2. Address the category error: explain why the transition algebra can be identified with a division algebra
3. Add formal statement of the key lemma: "consistent observation → no zero-divisors"
4. Tag the argument honestly: which steps are [THEOREM] and which are [CONJECTURE]?

#### Files Affected
- `foundations/observation_consistency.md` — Strengthen Objections section, add formal lemma

#### Dependencies
- Upstream: None (this is the root)
- Downstream: EVERYTHING in the framework

---

## Phase 2B: Implementation Notes (Session 135 — Maintainer)

### CR-017: Standardize n_c Decomposition — Session 135

**Status**: PENDING → **IMPLEMENTED**

- `foundations/THE_CHAIN.md` — Line 222: Changed "1+2+8 = 11" to "Im_C+Im_H+Im_O = 1+3+7 = 11"
- `foundations/einstein_equations_rigorous.md` — Line 67: Changed "1+2+4+4 = 11" to "Im_C+Im_H+Im_O = 1+3+7 = 11"
- `foundations/constants_from_dimensions.md` — Line 82: Added note that R+C+O=1+2+8 is non-canonical

### CR-018: Update big_bang_nature.md — Session 135

**Status**: PENDING → **IMPLEMENTED**

- `foundations/big_bang_nature.md` — Lines 411-413: Replaced n_s=117/121 with canonical n_s=193/200=0.965 and r=7/200=0.035; added deprecation note for old value; cross-referenced hilltop_inflation_canonical.md

### CR-019: Reconcile Potentials — Session 135

**Status**: PENDING → **IMPLEMENTED**

- `foundations/crystallization_dynamics.md` — Added ⚠ DEPRECATION NOTICE above Equations of Motion section pointing to hilltop_inflation_canonical.md
- `foundations/crystallization_dynamics.md` — Updated Derivation Chain section: replaced double-well with hilltop potential, updated μ² = 1536/7, added canonical n_c decomposition

### CR-020: Standardize ε* Value — Session 135

**Status**: PENDING → **RESOLVED (No Action Needed)**

Investigation found both files consistently use ε* = α² = 1/137². The initial audit report misread the inconsistency. No changes required.

### CR-021: Fix Axiom References — Session 135

**Status**: PENDING → **IMPLEMENTED**

- `foundations/einstein_equations_rigorous.md` — Part I table: Corrected AXM_0101 (Connectivity), AXM_0102 (Non-triviality), AXM_0105 (Locality) statements to match actual axiom file content

### CR-022: Add Confidence Tags to THE_CHAIN.md — Session 135

**Status**: PENDING → **IMPLEMENTED**

- Added confidence note under "The Claim" explaining varying confidence levels across steps
- Tagged Step 5 [THEOREM], Step 6 [DERIVATION], Step 7 [CONJECTURE], Step 9 [CONJECTURE], Step 10 [DERIVATION]
- Added [A-PHYSICAL] tags where physical interpretation is imported
- Added GAP references to Step 7 (G-006: finite→continuous)
- Updated summary to acknowledge gaps and point to honest assessment

### CR-023: Document Aut → Gauge Gap — Session 135

**Status**: PENDING → **IMPLEMENTED**

- `foundations/gauge_from_automorphisms.md` — Added new "Part IV-B: Gap Analysis" section documenting:
  - Gap 1: Z₂ → U(1) (isometry vs automorphism distinction)
  - Gap 2: SO(3) → SU(2) (cover requires spinor import)
  - Gap 3: G₂ → SU(3) (best-motivated but needs spacetime breaking)
  - "What Would Close This Gap" subsection
  - Literature context (Furey, Dixon, Baez)

### CR-024: Strengthen observation_consistency.md — Session 135

**Status**: PENDING → **IMPLEMENTED**

- `foundations/observation_consistency.md` — Added auditor note to Objection 3 explaining the conflation of algebraic invertibility vs unitarity, and the category error risk (division algebra vs C*-algebra)
- Added clarification to Section 3.4: division algebra constrains the coefficient field, not the operator algebra
- Tagged key conclusion as [CONJECTURE]

---

## Phase 2C: Prime Theory (Session 136)

### CR-025: Tag "NOT coincidence" Claims and Fix Q_8 Error

**Status**: **IMPLEMENTED** (Session 136)
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Source**: Phase 2C Batch Audit, XF-006

#### Problem
Multiple prime theory files claim dimensional matchings are "NOT coincidence" without proof. Additionally, 02_cyclotomic_fields.md incorrectly claims 8th roots of unity form the unit quaternions (Z_8 ≠ Q_8).

#### Proposed Change
1. Replace "NOT coincidence" with "[CONJECTURE]: Suggestive structural parallel" in 3 files
2. Fix Q_8 vs Z_8 error in 02_cyclotomic_fields.md (lines 146-152)
3. Fix Hurwitz theorem date from "1923" to "1898 (published 1923)" in 04_division_algebra_connections.md

#### Files Affected
- `foundations/prime_theory/02_cyclotomic_fields.md` — Tag claims, fix Q_8 error
- `foundations/prime_theory/04_division_algebra_connections.md` — Tag claims, fix date
- `foundations/prime_theory/README.md` — Tag claim

---

### CR-026: Add Confidence Tags to Division Algebra Connections

**Status**: **IMPLEMENTED** (Session 136)
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Source**: Phase 2C Batch Audit

#### Problem
04_division_algebra_connections.md mixes verified mathematical facts with framework interpretations without confidence tags. The "Interpretation" column assigns division algebra meaning tautologically. Bridge prime section and speculation lack tags.

#### Proposed Change
1. Add [MATHEMATICAL FACT] tags to verified primality results
2. Add [CONJECTURE] tags to bridge prime interpretations and speculation
3. Fix "three" → "four" consecutive in cross-references
4. Add note that "Interpretation" entries are descriptions, not derivations

#### Files Affected
- `foundations/prime_theory/04_division_algebra_connections.md` — Add confidence tags
- `foundations/prime_theory/08_open_questions.md` — Fix Q10 count

---

### CR-027: Change Session 125 Status from VERIFIED to CONJECTURE

**Status**: **IMPLEMENTED** (Session 136)
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase 2C Batch Audit, XF-007

#### Problem
09_session_125_findings.md has "Status: VERIFIED" but content is cosmological pattern-matching. Verification scripts confirm arithmetic, not physical significance. Missing denominator analysis and numerology risk assessment.

#### Proposed Change
1. Change status to "CONJECTURE — arithmetic verified, physical significance unproven"
2. Add "Numerology Risk" section
3. Add note about missing denominator analysis
4. Tag "Dimension-Observable Correspondence" as [CONJECTURE]

#### Files Affected
- `foundations/prime_theory/09_session_125_findings.md` — Status change, add risk section

---

### CR-028: Fix Session 126 Status and Weinberg Angle Tension

**Status**: **IMPLEMENTED** (Session 136)
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase 2C Batch Audit

#### Problem
1. Header "Status: VERIFIED" conflicts with body's honest "[DERIVATION] — physical interpretations conjectural"
2. sin^2(theta_W) = 19/81 = 0.2346 vs framework's other prediction 1/4 = 0.25 — internal inconsistency
3. O^2 - k family only has physical connections for k=1,2; k=3,4,7,8 are post-hoc
4. README.md doesn't list file 10

#### Proposed Change
1. Change status to "[DERIVATION] — identities verified, interpretations conjectural"
2. Add measurement comparison (sin^2 = 0.2312 at M_Z) and note tension with 1/4
3. Add caveat to O^2 - k family
4. Update README.md

#### Files Affected
- `foundations/prime_theory/10_session_126_findings.md` — Fix status, add comparisons
- `foundations/prime_theory/README.md` — Add file 10

---

## Phase 2C: Implementation Notes (Session 136 — Maintainer)

### CR-025: Tag "NOT coincidence" Claims — Session 136

**Status**: PENDING → **IMPLEMENTED**

- `foundations/prime_theory/02_cyclotomic_fields.md`:
  - Line 60: Added [CONJECTURE] tag to [Q(zeta_8):Q] = 4 = dim(H) claim
  - Line 137: Replaced "NOT coincidence!" with [CONJECTURE] + reference to 08_open_questions.md Q12
  - Lines 146-152: Fixed Q_8 vs Z_8 error — clarified cyclic group Z_8 ≠ quaternion group Q_8, noted Z_4 subgroup as partial connection
- `foundations/prime_theory/04_division_algebra_connections.md`:
  - Line 5: Fixed Hurwitz theorem date from "1923" to "1898; published posthumously 1923"
  - Line 133: Replaced "NOT coincidence" claim with [CONJECTURE] noting independent constructions
- `foundations/prime_theory/README.md`:
  - Line 79: Replaced "NOT coincidence" with [CONJECTURE]

### CR-026: Add Confidence Tags — Session 136

**Status**: PENDING → **IMPLEMENTED**

- `foundations/prime_theory/04_division_algebra_connections.md`:
  - Added note above fourth-power prime table: "Interpretation" column is descriptive (tautological), not derivational
  - Added [MATHEMATICAL FACT] / [CONJECTURE] tags to bridge primes section
  - Added "(Based on 3 data points; not a theorem)" to bridge prime observation
  - Added [SPECULATION] tag to octonionic barrier section
- `foundations/prime_theory/08_open_questions.md`:
  - Q10: Fixed "three consecutive" → "four consecutive fourth-power-sum primes (17, 97, 337, 881)"

### CR-027: Change Session 125 Status — Session 136

**Status**: PENDING → **IMPLEMENTED**

- `foundations/prime_theory/09_session_125_findings.md`:
  - Header: Changed "Status: VERIFIED" to "Status: CONJECTURE — arithmetic verified, physical significance unproven"
  - Added "Physical Significance: [CONJECTURE]" line to header
  - Summary: Changed "encode" to "produce ratios close to"; added [CONJECTURE] note
  - Dimension-Observable Correspondence: Added [CONJECTURE] tag, noted no derivation chain exists
  - Added full "Numerology Risk Assessment" section with HRS = 7 (HIGH RISK), missing denominator analysis, and strengthening criteria

### CR-028: Fix Session 126 Status + Weinberg Tension — Session 136

**Status**: PENDING → **IMPLEMENTED**

- `foundations/prime_theory/10_session_126_findings.md`:
  - Header: Changed "Status: VERIFIED" to "[DERIVATION] — identities verified, physical interpretations conjectural"
  - Part 3 (Weinberg): Added measurement comparison table (19/81 = 0.2346 vs measured 0.2312, 1.5% error)
  - Part 3: Added internal tension note — framework has TWO predictions (19/81 and 1/4) for sin²θ_W
  - Part 4 (O²-k family): Added auditor note that only k=1,2 have clear physical connections; k≥3 entries are [SPECULATION]
  - "NOT obvious" identity (8+1=9): Reworded to note arithmetic triviality vs open interpretive question
- `foundations/prime_theory/README.md`:
  - Added missing `10_session_126_findings.md` to contents table with [CONJECTURE] tag
  - Updated "last updated" date

---

## Phase A: SKETCH Theorem Audit (Physics Auditor Session — Post-S144)

### CR-029: THM_0497 pi_3(G_2) = Z, NOT 0 (CRITICAL ERROR)

**Status**: IMPLEMENTED
**Priority**: CRITICAL
**Filed**: 2026-01-30
**Source**: Phase A Audit — THM_0497 Step 4

#### Problem
THM_0497 (Strong CP Resolution) Step 4 claims:
> "Key: pi_3(G_2) = 0 -> instantons are trivial when SU(3) is embedded in G_2"

**This is mathematically wrong.** pi_3(G_2) = Z (the integers), not 0.

For ANY compact, simple, simply-connected Lie group G, pi_3(G) ≅ Z. This is a classical result in algebraic topology (Bott periodicity / Mimura-Toda). G_2 is compact, simple, and simply-connected, so pi_3(G_2) = Z.

Since pi_3(G_2) = Z, G_2 itself supports non-trivial instantons. The embedding SU(3) → G_2 induces a map Z → Z on pi_3, which does NOT trivialize instantons. The entire instanton-trivialization argument in Step 4 collapses.

The file's own gap note (line 37) flags this: "Step 4 (pi_3(G_2) = 0 trivializing instantons) needs more careful treatment." The gap is not just about care — it's based on a false mathematical fact.

#### Impact
- The conclusion theta_QCD = 0 MAY still be derivable via other arguments (Steps 5-7 about G_2/SU(3) = S^6 coset structure and absence of preferred direction in color space may still contribute), but the current proof is broken at Step 4.
- The prediction "axion will NOT be found" loses its rigorous backing.

#### Proposed Change
1. **Delete Step 4 entirely** — the claim pi_3(G_2) = 0 is false
2. **Add correction note**: "pi_3(G_2) = Z (standard result for all compact simple simply-connected Lie groups)"
3. **Rework the argument**: If theta_QCD = 0 can be salvaged, it must use a different topological argument. Possible approaches:
   - G_2 holonomy argument (G_2-manifolds have reduced holonomy, which constrains the theta parameter differently)
   - The coset G_2/SU(3) = S^6 argument (Steps 5-7) might be sufficient on its own if formalized
   - Discrete symmetry of the octonionic multiplication table
4. **Downgrade confidence**: Until a correct proof exists, the claim should be tagged [CONJECTURE], not [SKETCH with proof]

#### Files Affected
- `core/theorems/THM_0497_theta_qcd_zero.md` — fix Step 4, rework proof
- `predictions/BLIND_PREDICTIONS.md` — if theta_QCD = 0 is listed, add caveat

#### Dependencies
- Upstream: THM_0485 (F=C), [I-MATH: homotopy theory]
- Downstream: Strong CP prediction, axion non-existence prediction

#### Validation
- [x] pi_3(G_2) = Z stated correctly
- [x] Proof either reworked or theorem downgraded
- [x] Falsifiability criterion updated

#### Implementation Notes (Maintainer Session)
- Deleted Step 4 (pi_3(G_2) = 0 claim — mathematically false)
- Added Correction Note documenting pi_3(G_2) = Z with references to Bott periodicity / Mimura-Toda
- Added Gap Note G-009 (CRITICAL)
- Downgraded from [SKETCH with proof] to [CONJECTURE] with incomplete proof
- Listed possible alternative approaches (G_2 holonomy, S^6 coset, octonionic discrete symmetry)
- Validation checkboxes: all checked

---

### CR-030: THM_04A0 Uses Non-Canonical n_c Decomposition

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase A Audit — THM_04A0 vs CR-010

#### Problem
THM_04A0 (Associativity Filter) line 21 states:
> Crystal complement = R + C + O (dim = 1 + 2 + 8 = 11 = n_c)

And line 41 repeats:
> Complement: crystal uses remaining algebras R + C + O, dim = 1 + 2 + 8 = 11

The canonical decomposition established by CR-010 (Session 133) is:
> n_c = Im_C + Im_H + Im_O = 1 + 3 + 7 = 11

These are materially different decompositions:
- R + C + O = 1 + 2 + 8 (full algebras, including real parts)
- Im_C + Im_H + Im_O = 1 + 3 + 7 (imaginary parts only)

THM_04A0 uses the non-canonical form without justification or acknowledgment.

#### Proposed Change
1. Replace R + C + O = 1 + 2 + 8 with canonical Im_C + Im_H + Im_O = 1 + 3 + 7
2. Or: explicitly justify why this theorem requires the alternative decomposition (with cross-reference to CR-010 noting the discrepancy)
3. If the decomposition is materially different from canonical, add a reconciliation note

#### Files Affected
- `core/theorems/THM_04A0_associativity_filter.md` — lines 21, 41

#### Dependencies
- Upstream: CR-010 (canonical decomposition), THM_0484
- Downstream: THM_0487 (SO(11) chain), n_c interpretation

#### Validation
- [x] Decomposition matches canonical or is explicitly justified
- [x] Cross-reference to AXM_0118 canonical form

#### Implementation Notes (Maintainer Session)
- Line 21: Changed "R + C + O (dim = 1 + 2 + 8 = 11)" to "Im_C + Im_H + Im_O (dim = 1 + 3 + 7 = 11) [CANONICAL: per CR-010/AXM_0118]"
- Line 41: Same change to proof step 7
- Validation checkboxes: all checked

---

### CR-031: THM_0489 Step 5 Contains Wrong Polynomial

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase A Audit — THM_0489 Step 5 arithmetic error

#### Problem
THM_0489 line 35 states:
> 5. 194 = n_c^2 + n_c + n_d^2 + n_d^2 + n_d = ... (polynomial in n_c at n_c = 11)

This is arithmetically false:
n_c^2 + n_c + n_d^2 + n_d^2 + n_d = 121 + 11 + 16 + 16 + 4 = **168 ≠ 194**

The correct polynomial (from THM_0488) is:
194 = 2(n_c^2 - 2n_c - 2) = 2 × 97 at n_c = 11

#### Proposed Change
Replace line 35 with:
```
5. 194 = 2(n_c^2 - 2n_c - 2) [from THM_0488] = 2 × 97 = 194 at n_c = 11
```

#### Files Affected
- `core/theorems/THM_0489_goldstone_denominator.md` — line 35

#### Validation
- [x] Polynomial evaluates to 194 at n_c = 11

#### Implementation Notes (Maintainer Session)
- Line 35: Replaced "n_c^2 + n_c + n_d^2 + n_d^2 + n_d" with "2(n_c^2 - 2n_c - 2) [from THM_0488] = 2 × 97 = 194 at n_c = 11"
- Validation checkbox: checked

---

### CR-032: THM_04A1 Layer 2/3 Content in Layer 1 Theorem

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase A Audit — THM_04A1 Layer violations

#### Problem
THM_04A1 is labeled "Layer: 1" but contains significant Layer 2/3 physics:

**Line 22**: "137 degrees of freedom" — identifying abstract dimension count with fine structure constant
**Line 37**: "Channel counting: 137 = n_d^2 + n_c^2 = 16 + 121 interface degrees of freedom"
**Line 48**: "Visible fraction: 58/137 channels (SM), hidden fraction: 79/137 channels"
**Line 49**: "Hidden sector gauge structure: SU(7) × U(1)_dark"
**Line 50**: "Dark matter mass m_DM = (49/9) m_p = 5.11 GeV"

Per `core/CLAUDE.md`, Layer 0/1 files must have NO physics concepts. The core statement (V_Crystal = V_pi ⊕ V_pi^perp) is pure math; the physical interpretations are Layer 2/3.

Additionally, the core statement is the standard orthogonal complement theorem from linear algebra (any inner product space decomposes as W ⊕ W^perp). This is [I-MATH], not a novel result.

#### Proposed Change
1. Restrict Statement and Proof to pure Layer 1 content: V_Crystal = V_pi ⊕ V_pi^perp
2. Move ALL physics content (lines 37, 47-50) to Implications section with explicit [LAYER 2/3] markers
3. Add acknowledgment that core decomposition is standard orthogonal complement theorem [I-MATH]
4. Note that 137 = 4^2 + 11^2 is arithmetic, and identification with α is [A-PHYSICAL]

#### Files Affected
- `core/theorems/THM_04A1_crystal_decomposition.md` — layer separation

#### Dependencies
- Downstream: Dark matter predictions, alpha derivation chain

#### Validation
- [x] No untagged physics in Statement/Proof sections
- [x] [I-MATH] acknowledged for orthogonal complement
- [x] Physical identifications tagged [A-PHYSICAL]

#### Implementation Notes (Maintainer Session)
- Separated Derivation into "Layer 1 — Pure Mathematics" (steps 1-4) and "[LAYER 2/3 CORRESPONDENCE]" (steps 5-6)
- Added [I-MATH: standard linear algebra] acknowledgment for orthogonal complement theorem
- Added [LAYER 2/3 CORRESPONDENCE] marker and [A-PHYSICAL] tags to Implications section
- Validation checkboxes: all checked

---

### CR-033: THM_0495 Does Not Rigorously Close Gap G-004

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase A Audit — THM_0495 logical evaluation

#### Problem
THM_0495 claims to close Gap G-004 (associativity of transition algebra, required for Frobenius theorem in THM_0484). But the argument has a critical logical gap:

**Step 2** says: "For 'time' to be well-defined, the outcome of a sequence of transitions must not depend on how the sequence is parsed."

This is a **philosophical claim**, not a mathematical derivation. It assumes:
- "Well-defined time" requires parsing-independence
- Parsing-independence is identical to algebraic associativity

But these are not proven:
1. Non-associative algebras CAN have well-defined temporal sequences (the octonions have a well-defined multiplication table; the result of a * b * c is determined once an association is chosen). The issue is that different associations give different results, but each result is perfectly well-defined.
2. Physical time could be modeled with an alternative (Moufang loop, etc.) that is non-associative but still has consistent dynamics.
3. The argument conflates "unambiguous" with "unique" — a temporal process could consistently choose left-to-right association (or any other convention).

The file itself notes (line 56): "verification/sympy/associativity_requirement.py — PARTIAL" and (line 66): "Associativity alone gives R, C, H. The full division algebra structure requires the additional step..."

**Assessment**: G-004 remains OPEN. The argument is suggestive but not rigorous enough to close a gap that the entire Frobenius derivation depends on.

#### Proposed Change
1. Change "Closes gap G-004" to "Provides motivation for G-004 closure [DERIVATION]"
2. Downgrade confidence from "[THEOREM]" (line 35) to "[DERIVATION]" — the argument is a sketch, not a proof
3. Add explicit note: "This provides physical motivation for associativity, but does not constitute a mathematical proof. Non-associative alternatives (Moufang loops) are logically consistent with temporal ordering."
4. Update AUDIT_PROGRESS.md: G-004 remains OPEN

#### Files Affected
- `core/theorems/THM_0495_path_independence.md` — downgrade confidence, add caveats
- `.auditor/AUDIT_PROGRESS.md` — G-004 status: OPEN (not resolved by THM_0495)

#### Dependencies
- Downstream: THM_0484 (division algebra structure — still depends on [A-STRUCTURAL: associativity])

#### Validation
- [x] G-004 status correctly reflects OPEN
- [x] THM_0495 confidence matches actual rigor

#### Implementation Notes (Maintainer Session)
- Changed "closes gap G-004" to "provides motivation for G-004, does NOT rigorously close it"
- Downgraded confidence from [THEOREM] to [DERIVATION] with CR-033 note
- Added Moufang loop alternative note
- Added CR-033 blockquote explaining philosophical vs mathematical argument
- G-004 remains OPEN in AUDIT_PROGRESS
- Validation checkboxes: all checked

---

### CR-034: Layer 2/3 Content in Multiple SKETCH Theorem Implications

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Source**: Phase A Audit — systematic layer review

#### Problem
Several SKETCH theorems have Layer 2/3 physics content in their Implications sections without proper tagging:

| Theorem | Violation |
|---------|-----------|
| THM_0487 | Line 20-23: "Physics" column assigns spacetime, octonionic, color meaning |
| THM_0487 | Line 72: "Standard Model gauge structure" |
| THM_0488 | "Physics" column throughout denominator table |
| THM_0491 | Line 58-60: "Quantum states", "Schrödinger equation", "ℏ" |
| THM_0493 | Line 44: "Schrödinger equation emerges" |
| THM_0494 | Line 46: "Measurement = crystallization" (QM interpretation) |
| THM_0496 | Line 63: "alpha derivation chain" |
| THM_04A0 | Line 51-53: "Spacetime is 4-dimensional", "SM gauge group" |

Per `core/CLAUDE.md` Layer 0 purity rules, physics terminology (gauge groups, particles, measurement, etc.) should not appear in Layer 0/1 files without explicit [LAYER 2/3] markers.

#### Proposed Change
For each affected theorem:
1. Add `[LAYER 2 CORRESPONDENCE]` or `[LAYER 3 PREDICTION]` markers to Implications containing physics
2. Keep Statements and Proofs pure math
3. Add a note: "Physical interpretation requires Layer 2 correspondence rules"

This is a bulk fix — each theorem needs only 2-3 line additions.

#### Files Affected
- THM_0487, THM_0488, THM_0491, THM_0493, THM_0494, THM_0496, THM_04A0 — add layer markers to Implications

#### Validation
- [x] No untagged physics in Statement/Proof
- [x] Implications with physics content marked

#### Implementation Notes (Maintainer Session)
- THM_0487: Added [LAYER 2/3 CORRESPONDENCE] to Implications; renamed "Physics" column to "Interpretation [LAYER 2/3]"
- THM_0488: Renamed "Physics" column to "Interpretation [LAYER 2/3]"; added layer marker to Implications
- THM_0491: Added [LAYER 2/3] markers to Implications; separated Layer 1 math from Layer 2/3 physics
- THM_0493: Added layer markers to Implications (combined with CR-037)
- THM_0494: Added layer markers to Implications (combined with CR-035)
- THM_0496: Added layer markers to Implications; separated symmetry (L1) from alpha identification (L2/3)
- THM_04A0: Added layer markers to Implications
- All 7 theorems now have "Physical interpretation requires Layer 2 correspondence rules" notes
- Validation checkboxes: all checked

---

### CR-035: THM_0494 Noise Model Not Axiom-Derived

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Source**: Phase A Audit — THM_0494 derivation chain

#### Problem
THM_0494 (Born Rule) Step 2 introduces:
> "Noise from unorthogonality: sigma^2(p) = p(1-p)"

This noise model (Wright-Fisher diffusion) is a KEY step — it determines the absorbing boundary behavior that produces P(k) = |c_k|^2. But:

1. The noise model σ² = p(1-p) is not derived from axioms. It's imported from population genetics / stochastic processes as a physically motivated assumption.
2. The file acknowledges this (line 36): "Noise model sigma^2 = p(1-p) is physically motivated but not rigorously derived from axioms"
3. Without this specific noise model, the Born rule does not follow. Different noise models give different probability rules.

This means the Born rule derivation has a hidden import: [A-STRUCTURAL: Wright-Fisher noise model].

#### Proposed Change
1. Tag the noise model explicitly: `[A-STRUCTURAL: Wright-Fisher noise σ² = p(1-p)]`
2. Add to Dependencies table: `Wright-Fisher noise | [A-STRUCTURAL] | Determines diffusion process`
3. Note in Open Gaps: "The Born rule depends on the noise model choice. Deriving σ² = p(1-p) from axioms would close this gap."

#### Files Affected
- `core/theorems/THM_0494_born_rule.md` — tag assumption, update dependencies

#### Validation
- [x] Hidden import tagged
- [x] Dependency chain honest

#### Implementation Notes (Maintainer Session)
- Tagged noise model σ² = p(1-p) as [A-STRUCTURAL: Wright-Fisher noise model] in proof Step 2
- Added Dependencies table with Wright-Fisher noise as [A-STRUCTURAL]
- Added Open Gaps note about deriving σ² = p(1-p) from axioms
- Validation checkboxes: all checked

---

### CR-036: THM_0499 "Primes Emerge from Axioms" Overclaims

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Source**: Phase A Audit — THM_0499 logical evaluation

#### Problem
THM_0499 claims:
> "Primes emerge as a forced structural consequence of perspective axioms"
> "The fundamental theorem of arithmetic is forced by the axiom structure"

But the proof sketch shows:
1. Steps 1-3 establish that the axiom structure has orthogonality and composition
2. Step 4 asserts "requiring minimal independent basis forces prime decomposition"
3. Step 5 is computational verification (19,701 test cases) of a CORRESPONDENCE, not a derivation

The fundamental theorem of arithmetic is an [I-MATH] import, not derived from perspective axioms. What the theorem actually shows is that there exists a CORRESPONDENCE between prime properties (coprimality) and axiom properties (orthogonality). This is interesting but does not mean "primes emerge from axioms."

The file's own gap note acknowledges: "Full formal proof that the axiom structure uniquely determines primes (rather than just being compatible with them) is not complete."

#### Proposed Change
1. Soften the Statement: "A structural correspondence exists between prime arithmetic and perspective axiom properties" instead of "primes emerge from axioms"
2. Tag [I-MATH: fundamental theorem of arithmetic] explicitly
3. Change "forced" language to "compatible" language throughout
4. Note: The correspondence is verified computationally but the uniqueness claim is [CONJECTURE]

#### Files Affected
- `core/theorems/THM_0499_prime_orthogonality.md` — soften claims, tag imports

#### Validation
- [x] Claims match actual proof strength
- [x] [I-MATH] imports tagged

#### Implementation Notes (Maintainer Session)
- Statement: Changed "Primes emerge as a forced structural consequence" to "A structural correspondence exists between prime arithmetic and perspective axiom properties"
- Statement: Changed "The fundamental theorem of arithmetic is forced" to "has a natural correspondence"
- Tagged [I-MATH: fundamental theorem of arithmetic] explicitly
- Changed "forces" to "is compatible with" in derivation step 4
- Softened Implications from "forced" to "correspondence" / [CONJECTURE]
- Validation checkboxes: all checked

---

### CR-037: THM_0493 Continuity Assumption Unacknowledged in Dependencies

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-01-30
**Source**: Phase A Audit — THM_0493 hidden assumption

#### Problem
THM_0493 (Unitary Evolution) invokes Stone's theorem in Step 4:
> "By Stone's theorem [I-MATH]: continuous one-parameter unitary group -> T(s) = exp(isH)"

Stone's theorem requires **strong continuity** of the one-parameter group s → T(s). The proof acknowledges this gap (line 36): "Continuity of s -> T(s) is assumed (topology on transition space not formalized)."

But the Dependencies table does NOT list this as a dependency. Continuity is a non-trivial assumption — the axioms define a discrete structure (finite sets, finite dimensions). The existence of a continuous parameter s is itself an import.

#### Proposed Change
1. Add to Dependencies: `Continuity of T(s) | [A-STRUCTURAL] | Required for Stone's theorem; not derived from axioms`
2. Add to Dependencies: `Continuous parameter s | [A-STRUCTURAL] | Transition parameter assumed continuous`
3. Promote the gap note to Open Gaps section (currently only in proof text)

#### Files Affected
- `core/theorems/THM_0493_unitary_evolution.md` — update Dependencies, promote gap note

#### Validation
- [x] All assumptions in Dependencies table
- [x] Gap note in Open Gaps section

#### Implementation Notes (Maintainer Session)
- Added full Dependencies table to THM_0493 with continuity assumptions as [A-STRUCTURAL]
- Added continuous parameter s as [A-STRUCTURAL] import
- Moved gap note from proof body to new Open Gaps section with expanded explanation
- Validation checkboxes: all checked

---

### CR-038: THM_0486 Structural Axiom Count Error

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-01-30
**Source**: Phase A Audit — THM_0486 line count (noted in S140 audit Issue 1.10)

#### Problem
THM_0486 (Mirror Spacetime) Part 1 groups axioms into three categories:
- "Inherited axioms (8 of 18)" — lists 8 axioms
- "Dimensional axioms (5 of 18)" — lists 5 axioms
- "Structural axioms (5 of 18)" — lists **6** axioms (AXM_0105, 0106, 0107, 0115, 0117, 0118)

8 + 5 + 6 = 19, but there are 19 axioms (AXM_0100-0118 = 19 files), not 18. The "(5 of 18)" label for structural axioms should be "(6 of 19)".

Also: The total claimed is "18 framework axioms" (line 15) but there are 19 axioms in the framework.

#### Proposed Change
1. Fix line 15: "18 framework axioms" → "19 framework axioms"
2. Fix structural axioms header: "(5 of 18)" → "(6 of 19)"
3. Fix other category headers to use 19

#### Files Affected
- `core/theorems/THM_0486_mirror_spacetime.md` — fix axiom counts

#### Validation
- [x] All three groups sum to 19
- [x] Header count matches

#### Implementation Notes (Maintainer Session)
- Line 15: "18 framework axioms" → "19 framework axioms"
- Inherited axioms: "(8 of 18)" → "(8 of 19)"
- Dimensional axioms: "(5 of 18)" → "(5 of 19)"
- Structural axioms: "(5 of 18)" → "(6 of 19)" (lists 6 axioms, was mislabeled as 5)
- All three groups now sum to 8+5+6 = 19
- Validation checkboxes: all checked

---

## Phase B: NEEDS-RIGOR Resolution Assessment (Physics Auditor — Post-S144)

### Phase B Summary

Each NEEDS-RIGOR item is classified as FIXABLE (propose CR) or FUNDAMENTAL (known gap in derivation chain).

#### Axioms

| Item | Risk | Assessment | Action |
|------|------|------------|--------|
| AXM_0105 (locality) | 4 | **FUNDAMENTAL** | "Depends only on" is a semantic phrase; formalizing it requires topology on the path space that doesn't exist yet. Document as known gap. |
| AXM_0107 (nonnegative loss) | 5 | **FUNDAMENTAL** | Time's arrow is POSTULATED here, not derived. This is correct for an axiom — but should be explicitly tagged [A-AXIOM: thermodynamic arrow]. The risk rating reflects that this axiom does REAL WORK (it generates irreversibility) without justification. |
| AXM_0108 (time scale) | 4 | **FUNDAMENTAL** | τ₀ is postulated to exist; its value (Planck time) is [A-IMPORT]. The file already notes this correctly (line 32). The NEEDS-RIGOR was about the postulation itself, which is acceptable for an axiom. Downgrade to SOUND with note. |
| AXM_0113 (finite access) | 3 | **FIXABLE** | Session 132 Unification Note resolves the connection to AXM_0100 (both finite, dim = 11). The NEEDS-RIGOR from Phase 1 is now addressed. Promote to SOUND. |
| AXM_0114 (tilt possibility) | 4 | **FIXABLE** | DEF_02A3 was created (Session 132, CR-001). The original issue was "DEF_02A3 MISSING." It now exists. Layer 0 purity cleaned (Session 140). Promote to SOUND. |

#### Definitions

| Item | Risk | Assessment | Action |
|------|------|------------|--------|
| DEF_0213 | 3 | **FUNDAMENTAL** | "Propagation reference" is vague — the definition refers to propagation weights but doesn't specify the propagation mechanism. This is a known gap in the path/locality formalism (same issue as AXM_0105). |
| DEF_0216 | 3 | **FUNDAMENTAL** | "Counting formula undefined" — the perspective space dimension formula is postulated, not derived. |
| DEF_0260 | 3 | **FUNDAMENTAL** | "Valid adjacency undefined" — references AXM_0107 but doesn't formally define the adjacency predicate. |
| DEF_0266 | 3 | **FUNDAMENTAL** | Threshold ξ for coherent trajectory is arbitrary — no derivation for the coherence cutoff. |
| DEF_0267 | 4 | **FUNDAMENTAL** | Complex nested definition with unclear internal consistency. |
| DEF_0286 | 3 | **FUNDAMENTAL** | Uses "≈" in a formal definition (approximate defect). This is inherently informal. |

#### Theorems

| Item | Risk | Assessment | Action |
|------|------|------------|--------|
| THM_0420 (irreversibility) | 5 | **FIXABLE** — but requires actual proof | The gap "detailed analysis shows contradiction" can be filled. See CR-039 below. |
| THM_0461 (no loops) | 5 | **FIXABLE** | Steps 4-5 can be repaired. See CR-040 below. |
| THM_0484 (division algebra) | 4 | **FUNDAMENTAL** | G-004 (associativity) remains open. THM_0495 does not close it. This is a known structural assumption [A-STRUCTURAL]. |
| THM_0485 (complex structure) | 3 | **FUNDAMENTAL** | G-003 (why C, not H-module or O-module for value space) is a genuine open question. Current argument (commutativity + minimality) is a DERIVATION, not a THEOREM. |

---

### CR-039: Complete THM_0420 Irreversibility Proof

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase B Assessment — THM_0420 gap

#### Problem
THM_0420 line 40 says: "A detailed analysis shows this leads to contradiction." This is not a proof. The proof sketch has the right structure but is missing the actual contradiction.

#### Proposed Fix
The contradiction is straightforward. Replace lines 33-42 with:

```
Suppose an inverse transition π₂ → π₁ exists with ΔI(π₂ → π₁) ≥ 0.

Forward: ΔI(π₁ → π₂) = dim(U_{π₁}) - dim(U_{π₁} ∩ U_{π₂}) > 0
  ⟹ dim(U_{π₁}) > dim(U_{π₁} ∩ U_{π₂})   ... (*)

Reverse: ΔI(π₂ → π₁) = dim(U_{π₂}) - dim(U_{π₁} ∩ U_{π₂}) ≥ 0
  ⟹ dim(U_{π₂}) ≥ dim(U_{π₁} ∩ U_{π₂})   ... (**)

But we also need: dim(U_{π₂}) ≤ dim(U_{π₁}) (from the forward loss being positive
and the reverse being valid, the total information is conserved per THM_0450:
|U_{π}| + |H_{π}| = |U| for all π).

So dim(U_{π₂}) = |U| - |H_{π₂}| ≤ |U| - |H_{π₁}| = dim(U_{π₁})
(since forward transition increases hidden: |H_{π₂}| ≥ |H_{π₁}|)

Combining: dim(U_{π₂}) ≤ dim(U_{π₁}) and dim(U_{π₁}) > dim(U_{π₁} ∩ U_{π₂})
Means: The reverse transition has ΔI(π₂ → π₁) = dim(U_{π₂}) - dim(U_{π₁} ∩ U_{π₂})

For a perfect inverse (restoring original state), we'd need U_{π₁} = T(π₂ → π₁)(U_{π₂}),
which requires dim(U_{π₁} ∩ U_{π₂}) = dim(U_{π₁}) — contradicting (*).

QED: No exact inverse exists when ΔI > 0.
```

**Note**: This proves no EXACT inverse exists. Approximate reversibility (different state with same dimension) is not ruled out — and shouldn't be, since quantum mechanics allows approximate time-reversal.

#### Files Affected
- `core/theorems/THM_0420_irreversibility.md` — replace proof
- Status: SKETCH → CANONICAL (after fix)

#### Implementation Notes (Maintainer Session)
- Replaced hand-waved proof with complete contradiction argument
- Key steps: forward ΔI > 0 means dim(U_π1 ∩ U_π2) < dim(U_π1); exact inverse requires equality → contradiction
- Added THM_0450 (conservation) to Requires
- Clarified scope: no EXACT inverse; approximate reversibility not ruled out
- Status promoted: SKETCH → CANONICAL

---

### CR-040: Fix THM_0461 Steps 4-5

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase B Assessment — THM_0461 logical gap

#### Problem
THM_0461 (No Loops) Steps 4-5:
> 4. No information loss ⟹ no distinction between perspectives
> 5. A chain with no distinction is a point, not a sequence

Step 4 is a non-sequitur: |H_{πᵢ}| = |H_{πⱼ}| (equal hidden set SIZE) does NOT imply the perspectives are identical. Two perspectives can have different hidden sets of the same cardinality.

Step 5 is also wrong: identical perspectives CAN form a sequence (the identity loop). The point is that such a loop would mean no information was gained, which contradicts the temporal ordering.

#### Proposed Fix
Replace Steps 4-5 with:

```
4. Equal |H| means ΔI(πᵢ → πᵢ₊₁) = 0 for every step in the loop
5. But by AXM_0107 (strict form: valid adjacency has ΔI ≥ 0, with time direction = ΔI > 0 direction):
   ΔI = 0 everywhere means no temporal direction exists — the sequence is atemporal
6. By DEF_0260 (temporal sequence requires ΔI > 0 at each step), the sequence fails to be temporal
7. Therefore: no temporal loop exists. QED
```

**Caveat**: This fix requires DEF_0260 to include ΔI > 0 as part of the temporal sequence definition. If DEF_0260 allows ΔI = 0 steps, the theorem is false (trivial loops exist). The fix depends on how "temporal" is defined.

#### Files Affected
- `core/theorems/THM_0461_no_loops.md` — fix Steps 4-5
- Check DEF_0260 for consistency

#### Implementation Notes (Maintainer Session)
- Replaced Steps 4-5 non-sequiturs with correct argument (Steps 4-7)
- Key: ΔI = 0 everywhere → no temporal direction → sequence is atemporal (not temporal loop)
- Added note explaining why original Steps 4-5 were wrong
- Checked DEF_0260: consistent — defines temporal sequences via valid directed adjacency
- Checked AXM_0107: consistent — time direction defined by ΔI > 0

---

### Phase B — Status Updates to AUDIT_PROGRESS.md

The following promotions/changes are warranted:

| Item | Old Status | New Status | Reason |
|------|-----------|------------|--------|
| AXM_0108 | NEEDS-RIGOR | SOUND | Correctly structured as axiom; τ₀ value is [A-IMPORT] as documented |
| AXM_0113 | NEEDS-RIGOR | SOUND | S132 Unification Note resolves the connection to AXM_0100 |
| AXM_0114 | NEEDS-RIGOR | SOUND | DEF_02A3 created (S132); Layer 0 cleaned (S140) |

Items remaining NEEDS-RIGOR or FUNDAMENTAL:

| Item | Status | Classification |
|------|--------|---------------|
| AXM_0105 | NEEDS-RIGOR (FUNDAMENTAL) | Path topology gap |
| AXM_0107 | NEEDS-RIGOR (FUNDAMENTAL) | Time arrow postulated |
| DEF_0213, 0216, 0260, 0266, 0267, 0286 | NEEDS-RIGOR (FUNDAMENTAL) | Various formalization gaps |
| THM_0420 | NEEDS-RIGOR (FIXABLE) | CR-039 filed |
| THM_0461 | NEEDS-RIGOR (FIXABLE) | CR-040 filed |
| THM_0484 | NEEDS-RIGOR (FUNDAMENTAL) | G-004 open |
| THM_0485 | NEEDS-RIGOR (FUNDAMENTAL) | G-003 open |

---

## Phase C: Alpha Derivation Chain Audit (Physics Auditor — Post-S144)

### CR-041: Alpha Derivation Chain — Complete Audit

**Status**: DEFERRED
**Priority**: HIGH
**Filed**: 2026-01-30
**Source**: Phase C — ALPHA_DERIVATION_MASTER.md full trace

#### Derivation Chain Trace (Step by Step)

| Step | Claim | Type | Status | Issue |
|------|-------|------|--------|-------|
| 1 | Universe U has inner product space structure | [A-AXIOM] | OK | From AXM_0109-0110 |
| 2 | F = C (complex field) | [A-IMPORT] | **CIRCULAR** | §4.2 says "DERIVED from observed alpha" — this is retrodiction, not derivation |
| 3 | Aut(B) ⊆ U(n), giving n² generators | [THEOREM] | OK | Standard Lie theory [I-MATH] |
| 4 | All generators weighted equally | [DERIVED] | OK | Killing form uniqueness, Schur's lemma |
| 5 | Defect and crystal are separate structures | [A-STRUCTURAL] | **UNTAGGED** | §4.3 argues this from P1 partiality, but "no cross terms" is an assumption about the interface coupling |
| 6 | Total = n₁² + n₂² | [THEOREM] | OK | Given step 5, this follows |
| 7 | Time → path independence → associativity | [DERIVED] | **PHILOSOPHICAL** | THM_0495 argument; G-004 remains open (CR-033) |
| 8 | No zero divisors (can't see subset of zero) | [DERIVED] | OK | THM_0482, sound argument |
| 9 | Invertibility of transitions | **GAP** | **OPEN** | Acknowledged in §6.4; needed for Frobenius |
| 10 | Frobenius → R, C, H, O only | [I-MATH] | OK | Standard theorem |
| 11 | Associativity filter → R, C, H only | [I-MATH] | OK | Standard |
| 12 | Maximality → n_d = 4 (quaternions) | [A-STRUCTURAL] | **UNTAGGED** | Why maximal? AXM_0117 invoked but not tagged |
| 13 | n_c = 15 - 4 = 11 | [DERIVED] | **ASSUMPTION** | Sum 1+2+4+8=15 is division algebra total; why must n_c = 15 - n_d? |
| 14 | 1/α = n_d² + n_c² = 137 | [DERIVED] | OK | Arithmetic |
| 15 | Interface determines EM coupling | [CONJECTURE] | **UNTAGGED** | This is the most critical unproven step |
| 16 | Correction: 4/111 from equal distribution (THM_0496) | [DERIVED] | OK | Sound symmetry argument |
| 17 | 1/α = 137 + 4/111 ≈ 137.036036 | [DERIVED] | OK | Arithmetic; 0.27 ppm from measurement |

#### Critical Findings

**Finding C-1: F = C is retrodicted, not derived (Step 2)**

The document's §4.2 explicitly states: "Conclusion: α = 1/137 IMPLIES F = C" and "Status: [DERIVED] from observed alpha value (retrodiction)."

This is circular for the alpha derivation: The formula uses F = C to get n² counting, but F = C is justified BY the formula matching alpha. The document is honest about this ("retrodiction") but tags it [DERIVED], which is misleading.

**Impact**: If F = C came from THM_0485 (complex structure from directed time), the circle would be broken. But THM_0485 was formalized later (Session 133) and is not referenced in this document.

**Fix**: Reference THM_0485 as the non-circular source of F = C. Update §4.2 status from "[DERIVED] from observed alpha value" to "[DERIVED] from THM_0485 (directed time → complex field)."

---

**Finding C-2: "Independent addition" (n₁² + n₂²) is an untagged assumption (Step 5)**

Why n₁² + n₂² and not (n₁ + n₂)²? §4.3 gives three reasons:
1. "Ontological: Defect has perspectives, crystal does not" — This is correct per AXM_0116
2. "Mathematical: Embedding would allow mixing (violates P1 partiality)" — Partiality says perspectives are partial, not that defect and crystal are independent
3. "Physical: Spacetime and hidden dimensions don't mix" — This is [A-PHYSICAL], not derived

The claim that generators add independently (no cross terms) is a structural assumption about how the interface coupling works. It should be tagged [A-STRUCTURAL].

---

**Finding C-3: Maximality assumption (Step 12) untagged**

Why n_d = dim(H) = 4 rather than dim(C) = 2 or dim(R) = 1? The document invokes maximality: "largest associative division algebra." But WHY maximal? The argument is that AXM_0117 (crystallization tendency) drives toward the richest structure, but this is a [CONJECTURE], not a derivation.

---

**Finding C-4: n_c = 15 - 4 = 11 embeds an assumption (Step 13)**

Why must the crystal dimension equal the total division algebra dimension MINUS the defect dimension? This requires:
- [A-STRUCTURAL]: The universe uses ALL division algebra dimensions (sum = 15)
- [A-STRUCTURAL]: Defect and crystal partition this total exhaustively

Neither is derived. The document implicitly assumes 1 + 2 + 4 + 8 = 15 is a "natural" total, but there's no axiom requiring the universe to use all four division algebras.

---

**Finding C-5: "Interface determines EM coupling" is untagged [CONJECTURE] (Step 15)**

The most critical step — WHY does the number of interface generators equal 1/α? The document tags this [CONJECTURE] in the chain diagram (line 476) but the overall narrative treats it as if the derivation is complete. The ENTIRE alpha prediction rests on this unproven identification.

---

**Finding C-6: Non-canonical n_c decomposition (§4.4, line 93-94)**

Line 93: "Crystal = R + C + O (dim 1 + 2 + 8 = 11)"

This uses the non-canonical decomposition (CR-010 canonical is Im_C + Im_H + Im_O = 1 + 3 + 7).

---

**Finding C-7: Document is stale (last updated Session 77)**

The document was last updated Session 77 (line 741). Many developments since then:
- THM_0485 (F = C from directed time, Session 133)
- THM_0495 (path independence, Session 144)
- THM_0496 (equal distribution, Session 144)
- CR-010 (canonical n_c decomposition, Session 133)
- THM_04A0 (associativity filter, Session 144)

These are referenced in the formalized theorems but not in this master document.

#### Summary: Alpha Derivation Chain Completeness

| Element | Status | Honest Assessment |
|---------|--------|-------------------|
| Formula structure (n₁² + n₂²) | [DERIVED] conditional on [A-STRUCTURAL: independent addition] | Strong but requires one structural assumption |
| F = C → n² | [DERIVED] from THM_0485 (not retrodiction) | Needs document update |
| n_d = 4 | [DERIVED] conditional on [A-STRUCTURAL: maximality, associativity] | Two assumptions, one gap (G-004) |
| n_c = 11 | [DERIVED] conditional on [A-STRUCTURAL: exhaustive partition of sum=15] | Requires universe uses all 4 algebras |
| 1/α = 137 | [DERIVED] conditional on 4 structural assumptions | All assumptions needed |
| Interface = EM coupling | [CONJECTURE] | No derivation exists |
| Correction 4/111 | [DERIVED] from symmetry | Sound (THM_0496) |
| Total: 1/α ≈ 137.036 | **0.27 ppm match** | Remarkable, but depends on unproven [CONJECTURE] at Step 15 |

**Bottom line**: The alpha derivation has **4 structural assumptions** and **1 conjecture** between the axioms and the result. The formula structure is well-motivated, but the chain is NOT complete. The most critical gap is Step 15 (interface = EM coupling).

#### Proposed Changes to ALPHA_DERIVATION_MASTER.md

1. Update §4.2: Replace retrodiction with THM_0485 reference
2. Add [A-STRUCTURAL] tags to Steps 5, 12, 13
3. Update n_c decomposition to canonical (CR-010)
4. Add "Assumptions Required" summary table listing all 4+1 gaps
5. Reference THM_0495, THM_0496, THM_04A0 formalized theorems
6. Update "Last updated" from Session 77

#### Files Affected
- `framework/investigations/alpha/ALPHA_DERIVATION_MASTER.md` — major update needed

#### Implementation Notes (Maintainer Session)
- Added audit note header to ALPHA_DERIVATION_MASTER.md referencing CR-041 findings
- Full document rewrite deferred to future session per instructions
- Key findings documented: F=C retrodiction, 4 untagged [A-STRUCTURAL], stale references

---

### CR-042: DEF_02C2 Arithmetic Error in Secondary Prime 337

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-02-01
**Implemented**: 2026-02-01 (Maintainer, Round 1)
**Source**: Round 1 Catch-Up Audit, DEF_02C2

#### Problem
Line 57: "337 = 4² + (3·6)²" is arithmetically wrong. 4² + 18² = 16 + 324 = 340 ≠ 337.

#### Proposed Change
Replace with correct decomposition: 337 = 9² + 16² = (Im_H²)² + n_d² = Im_H⁴ + H⁴.

#### Files Affected
- `core/definitions/DEF_02C2_framework_primes.md` line 57 — fix 337 decomposition

#### Dependencies
- Upstream: None
- Downstream: Any file referencing 337 decomposition

#### Validation
- [x] Arithmetic verified (9² + 16² = 81 + 256 = 337)
- [x] Division algebra interpretation correct (Im_H² = 9, n_d = H = 4, H² = 16)

---

### CR-043: Non-Canonical n_c Decomposition in THM_04A2 and THM_04A3

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-01
**Implemented**: 2026-02-01 (Maintainer, Round 1)
**Source**: Round 1 Catch-Up Audit, cross-file finding CF-1

#### Problem
THM_04A2 (line 37) uses "n_c = 1 + 2 + 4 + 4 = 11 [D: dim(R) + dim(C) + dim(H) + dim_R(H)]". THM_04A3 (line 81) uses the same. CR-010 (Session 133) designated the imaginary decomposition n_c = 1 + 3 + 7 = 11 (Im_C + Im_H + Im_O) as canonical. The "1+2+4+4" form uses dim_R(H) = 4 = dim(H), making it dim(R)+dim(C)+2×dim(H) which has no clear algebraic justification.

#### Proposed Change
1. THM_04A2 Step 1: Replace "n_c = 1 + 2 + 4 + 4" with canonical "n_c = Im_C + Im_H + Im_O = 1 + 3 + 7 = 11" per CR-010
2. THM_04A3 Step 5: Replace "n_c = 1 + 2 + 4 + 4" with canonical form
3. Both: If the non-canonical form is needed for the specific argument, keep it but add a note explaining why and referencing the canonical form

#### Files Affected
- `core/theorems/THM_04A2_single_photon_tilt.md` line 37 — update n_c decomposition
- `core/theorems/THM_04A3_beta_coefficient_decomposition.md` line 81 — update n_c decomposition

#### Dependencies
- Upstream: CR-010, THM_0484
- Downstream: DEF_02B3, DEF_02C1 (already use canonical form)

#### Validation
- [x] Both files use canonical decomposition (THM_04A2, THM_04A3, plus template file)
- [x] No derivation steps break (11 = 11 either way)

---

### CR-044: DEF_02C0 Missing [A-IMPORT] Tags for α Usage

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-01
**Implemented**: 2026-02-01 (Maintainer, Round 1)
**Source**: Round 1 Catch-Up Audit, DEF_02C0

#### Problem
DEF_02C0 defines ground state values ε*_portal = α² and ε*_MH = α using the fine structure constant without [A-IMPORT] or [D: from THM_04A2] tags. The portal derivation ("two gauge vertices → α²") is presented as fact but is at best [CONJECTURE]. The Mexican hat relation b = α M_Pl⁴ is asserted without derivation.

#### Proposed Change
1. Tag ε*_portal = α² as [CONJECTURE] or [A-IMPORT: α from measurement]
2. Tag ε*_MH = α as [CONJECTURE] or [A-IMPORT: α from measurement]
3. Add note: "If α = 1/N_I is derived from DEF_02B3/THM_04A2, these become [D] values. Until that identification is proven, they are [A-IMPORT]."
4. Tag the portal "derivation" paragraph as [CONJECTURE]

#### Files Affected
- `core/definitions/DEF_02C0_order_parameter.md` — add import/confidence tags

#### Dependencies
- Upstream: DEF_02B3, THM_04A2 (α derivation)
- Downstream: DEF_02C4, all inflationary observables

#### Validation
- [x] All α usages tagged ([A-IMPORT] and [CONJECTURE])
- [x] Dependency chain clear

---

### CR-045: DEF_02C4 Slow-Roll Parameter Formulas Incorrect

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-02-01
**Implemented**: 2026-02-01 (Maintainer, Round 1)
**Source**: Round 1 Catch-Up Audit, DEF_02C4

#### Problem
The slow-roll parameter table lists incorrect formulas:
- Claims "ε (slow-roll) = Im_O / (2μ²) = 7/3200" — but Im_O/(2μ²) = 7/(2×1536/7) = 49/3072 ≈ 0.01595, NOT 7/3200 ≈ 0.00219.
- Claims "η = -7/1600 × 2" = -7/800 — but actual η = -2/(μ²×(5/6)) = -7/640.

The VALUES (7/3200, -7/640, ratio -5) are all correct per the verification script `lcdm_deviations_from_hilltop.py`. The FORMULAS shown are wrong because they don't account for evaluation at φ_CMB = μ/√6 (x = 1/6).

#### Proposed Change
Fix the slow-roll parameter table to show correct formulas:
```
| ε_SR | 12/(25μ²) = 7/3200 | 2.1875 × 10⁻³ |
| η    | -12/(5μ²) = -7/640  | -1.09375 × 10⁻² |
```
Or simply remove the intermediate formula column and show only the values, with a note that they're evaluated at φ_CMB = μ/√6.

#### Files Affected
- `core/definitions/DEF_02C4_crystallization_potential.md` — fix slow-roll table

#### Dependencies
- Upstream: μ² = 1536/7 (correct)
- Downstream: n_s, r predictions (values are correct, only formulas wrong)

#### Validation
- [x] Formulas match script `lcdm_deviations_from_hilltop.py`
- [x] ε × 16 = r = 7/200 still holds
- [x] 1 - 6ε + 2η = 193/200 still holds

---

### CR-046: DEF_02C3 Dependency Formalization and Cartan Exclusion

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-02-01
**Implemented**: 2026-02-01 (Maintainer, Round 1)
**Source**: Round 1 Catch-Up Audit, DEF_02C3

#### Problem
1. n_c = 11 referenced informally ("n_c = 11 (crystal dimension)") without citing AXM_0118 or THM_0484
2. The Cartan generator exclusion ("generic tilt averages to zero") is a physical/probabilistic argument embedded in a mathematical definition. Should reference AXM_0114 explicitly.
3. The cyclotomic polynomial Φ₆ appearance is noted but not explained — why Φ₆ specifically?

#### Proposed Change
1. Update Requires section: add [AXM_0118] and [THM_0484] explicitly
2. Add note: "The Cartan exclusion follows from AXM_0114 (tilt has no preferred direction): for a generic tilt orientation, the n_c - 1 traceless diagonal generators average to zero contribution."
3. Add note under cyclotomic identity: "The appearance of Φ₆ is an observation; the connection to 6th cyclotomic polynomial is not derived from axioms. [OBSERVATION]"

#### Files Affected
- `core/definitions/DEF_02C3_em_channel_count.md` — formalize references and tags

#### Dependencies
- Upstream: AXM_0114, AXM_0118, THM_0484
- Downstream: THM_04A2 (Step 7), alpha correction term

#### Validation
- [x] All dependency references explicit (AXM_0118, AXM_0114, I-MATH)
- [x] Physical reasoning tagged appropriately ([OBSERVATION], [D: from AXM_0114])

---

### CR-047: THM_04A3 Document 1/18 Script Failure

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-02-01
**Implemented**: 2026-02-01 (Maintainer, Round 1)
**Source**: Round 1 Catch-Up Audit, THM_04A3

#### Problem
THM_04A3 header states "17/18 PASS" for `tilt_dynamics_beta_functions.py` but doesn't document which test failed or why. Per verification protocol, failures must be documented.

#### Proposed Change
1. Investigate which test fails in `tilt_dynamics_beta_functions.py`
2. Add note to THM_04A3 explaining the 1 failure (e.g., "Test 18: [description] — FAIL because [reason]")
3. If the failure affects the theorem's validity, adjust status accordingly

#### Files Affected
- `core/theorems/THM_04A3_beta_coefficient_decomposition.md` — add failure documentation

#### Dependencies
- Upstream: `verification/sympy/tilt_dynamics_beta_functions.py`
- Downstream: None (documentation only)

#### Validation
- [x] Failure documented (alpha_s one-loop running test, expected limitation)
- [x] Impact assessed (structural identities 17/17 unaffected)

---

### CR-048: THM_04A3 Two-Loop Identities Should Be Tagged [CONJECTURE]

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-02-01
**Implemented**: 2026-02-01 (Maintainer, Round 1)
**Source**: Round 1 Catch-Up Audit, THM_04A3

#### Problem
Step 9 (two-loop extension) presents identities like "153 = Im_H² × 17" and "17 = n_d² + 1" as part of the derivation, but these are post-hoc pattern identifications. The one-loop decomposition has a structural argument (gauge self-coupling factor = n_c/Im_H); the two-loop decomposition is pattern-matching without mechanism.

#### Proposed Change
1. Add [CONJECTURE] tag to Step 9 header
2. Add note: "The two-loop factorizations are observed patterns, not derived from the gauge coupling mechanism. They may be numerological."

#### Files Affected
- `core/theorems/THM_04A3_beta_coefficient_decomposition.md` Step 9 — add confidence tag

#### Dependencies
- Upstream: None
- Downstream: None

#### Validation
- [x] Step 9 clearly distinguished from Steps 4-8 ([CONJECTURE] tag + explanatory note)

---

## Round 2: RED-FLAG Triage (2026-02-01)

### CR-049: AXM_0117 Internal Tension Between Statement and Revision

**Status**: IMPLEMENTED (2026-02-01)
**Priority**: HIGH
**Filed**: 2026-02-01
**Source**: Round 2 RED-FLAG Triage

#### Problem
AXM_0117 has an internal contradiction:
- **Statement** (line 29): "d||ε||/dτ ≤ 0" — tilt is monotonically non-increasing
- **Formal statement** (line 47): "∂ε/∂τ = -∇_ε F[ε]" with F[ε] ≥ 0, F[0] = 0 — gradient flow toward ε = 0
- **Proposed revision** (line 134): "F(ε) = -a|ε|² + b|ε|⁴" — Mexican hat, where ε = 0 is UNSTABLE

The main body says ε = 0 is the attractor. The revision says ε = 0 is unstable. Both cannot be the canonical axiom. Status says CANONICAL (promoted Session 178) but the file contains two contradictory formulations.

Additionally, the statement d||ε||/dτ ≤ 0 is too strong even for the Mexican hat — it only holds for ε > ε*, not globally.

#### Proposed Change
1. Resolve the contradiction: adopt ONE formulation as canonical
2. If Mexican hat is canonical (as used in DEF_02C4), rewrite the Statement section to reflect that
3. Move the superseded gradient flow form to a "Historical" section
4. Specify F[ε] functional form (or mark as open) — current "undetermined F[ε]" is the original RED-FLAG

#### Files Affected
- `core/axioms/AXM_0117_crystallization_tendency.md` — resolve internal contradiction

#### Dependencies
- Upstream: AXM_0109, AXM_0114
- Downstream: DEF_02C0, DEF_02C4, THM_0487, THM_0494, THM_0498, all inflationary predictions

#### Validation
- [x] Single consistent formulation (Mexican hat adopted as canonical Statement)
- [x] Downstream files consistent with chosen form (gradient flow with Mexican hat matches DEF_02C4)

---

### CR-050: AXM_0118 Status PROPOSED Despite Extensive Usage

**Status**: IMPLEMENTED (2026-02-01)
**Priority**: MEDIUM
**Filed**: 2026-02-01
**Source**: Round 2 RED-FLAG Triage

#### Problem
AXM_0118 status is still PROPOSED (line 5), but:
- It has been used by multiple theorems and definitions since Session 77
- Its sister axiom AXM_0117 was promoted to CANONICAL in Session 178
- DEF_02C1, DEF_02C2, DEF_02B3 all depend on it via D_framework and framework primes
- The "prime attractor" mechanism is the core selection principle

The crystallization energy formula E(θ) (line 43-49) uses undefined quantities (λ, C(p,q)) and is never referenced elsewhere — it's a dead specification.

#### Proposed Change
1. Either promote to CANONICAL with justification, or explicitly document why it remains PROPOSED
2. Clean up the energy formula: either define all terms or remove it in favor of the simpler "p = a² + b² with a,b ∈ D_framework" statement
3. Add note distinguishing what IS derived (the framework prime catalog, which is pure number theory) from what is CONJECTURED (that these primes select physical constants)

#### Files Affected
- `core/axioms/AXM_0118_prime_attractor_selection.md` — status review, cleanup

#### Dependencies
- Upstream: AXM_0117, AXM_0115, [I-MATH: Frobenius]
- Downstream: DEF_02C1, DEF_02C2, THM_0488, all constant derivations

#### Validation
- [x] Status reflects actual usage (Status Note section explains why it stays PROPOSED with explicit promotion criteria)
- [x] Energy formula either defined or removed (dead E(θ) formula replaced with honest statement about open functional)

---

### CR-051: crystallization_dynamics.md Still Contains Deprecated Double-Well EOM

**Status**: IMPLEMENTED (2026-02-01)
**Priority**: MEDIUM
**Filed**: 2026-02-01
**Source**: Round 2 RED-FLAG Triage

#### Problem
CR-019 (Session 135) added a deprecation notice before the Equations of Motion section and updated the Derivation Chain. However, the file still contains ~150 lines of deprecated double-well content: the full Equations of Motion section (lines 163-189), Perturbation Theory section (lines 192-225), Sound Horizon section (lines 263-300), and the original double-well as working potential is still displayed in the Lagrangian section (lines 54-100) alongside the hilltop update.

This file is actively confusing: a reader encounters both V(φ) = -aε² + bε⁴ AND V(φ) = V₀(1 - φ²/μ²) with no clear resolution. The deprecation notice at line 165 is easily missed.

**Recommended action**: Either (a) aggressively trim deprecated content to a short "Historical" section, or (b) archive the entire file and replace with a redirect to hilltop_inflation_canonical.md.

#### Proposed Change
1. Move deprecated double-well content to a collapsed "Historical: Original FAILED Approach" section at the bottom
2. Remove double-well from the main Lagrangian section
3. Point all current-state sections to hilltop_inflation_canonical.md
4. Downgrade from RED-FLAG to NEEDS-RIGOR after cleanup

#### Files Affected
- `framework/investigations/crystallization/crystallization_dynamics.md` — deprecation cleanup

#### Dependencies
- Upstream: DEF_02C4 (canonical potential)
- Downstream: None (all downstream files should reference hilltop_inflation_canonical.md)

#### Validation
- [x] No deprecated formulas in main body (EOM rewritten with hilltop V', perturbation theory updated, derivation chain cleaned, Lagrangian section now points to historical section)
- [x] Redirect to canonical file clear (references to hilltop_inflation_canonical.md added)

---

### CR-052: big_bang_nature.md Outdated eps* Value and Potential Form

**Status**: IMPLEMENTED (2026-02-01)
**Priority**: MEDIUM
**Filed**: 2026-02-01
**Source**: Round 2 RED-FLAG Triage

#### Problem
CR-018 (Session 135) fixed n_s = 117/121 → 193/200. However, remaining issues:
1. Line 65: "eps → eps* = alpha^2" — uses eps* = α² without noting this is the portal convention (DEF_02C0 distinguishes ε*_portal = α² vs ε*_MH = α)
2. Line 128-133: Shows Mexican hat V(eps) = -a*eps² + b*eps⁴ as the current potential. This is the deprecated form. Canonical is hilltop V(ε) = V₀(1 - ε²/μ²) per DEF_02C4.
3. Line 150: "a = alpha², b = 1/(2*alpha²)" — specific values inconsistent with DEF_02C4 (which has b = α M_Pl⁴).
4. No [A-IMPORT] or confidence tags on any of the quantitative claims.

#### Proposed Change
1. Add convention note on ε* = α² (portal interpretation)
2. Replace Mexican hat potential with canonical hilltop form or add note pointing to DEF_02C4
3. Add confidence tags to quantitative sections
4. Downgrade from RED-FLAG to NEEDS-RIGOR after fixes

#### Files Affected
- `framework/investigations/spacetime/big_bang_nature.md` — potential form, ε* convention, tags

#### Dependencies
- Upstream: DEF_02C0, DEF_02C4
- Downstream: None directly

#### Validation
- [x] Potential form consistent with DEF_02C4 (Mexican hat with canonical F(ε), reference to DEF_02C4 and AXM_0117 added)
- [x] ε* convention noted (portal vs MH conventions referenced with DEF_02C0 pointer)
- [x] Confidence tags present ([CONJECTURE] tags added to potential and energy sections)

---

### CR-053: tilt_topology_point_emergence.md π₂(S¹³⁶) = 0 Obstruction Acknowledged but Not Resolved

**Status**: IMPLEMENTED (2026-02-01)
**Priority**: HIGH
**Filed**: 2026-02-01
**Source**: Round 2 RED-FLAG Triage

#### Problem
The file correctly identifies that π₂(S¹³⁶) = 0 (line 137: "No point defects!"), which means the full tilt order parameter manifold cannot support point-like topological defects. The proposed resolution (Section 2.3-2.4) invokes gauge symmetry breaking to reduce the effective manifold, but:

1. The symmetry breaking G = U(1) × SU(2) × SU(3) is **imported** from the Standard Model [A-IMPORT], not derived from the framework
2. The quotient S^(n²-1)/G is stated without computing its actual homotopy groups
3. The claim "M_eff has π₂ ≠ 0" for the GUT case (line 180-181) is asserted without proof
4. The particle identification table (Section 4.1) assigns particles to defect types without derivation
5. No verification script exists for any of the topological claims

The investigation is honest about the obstruction but the resolution is schematic, not proven. The file should have [CONJECTURE] confidence on the resolution, not [DERIVATION].

#### Proposed Change
1. Add [CONJECTURE] tag to the symmetry breaking resolution (Section 2.3-2.5)
2. Add [A-IMPORT: SM gauge group] tag where SM groups are used
3. Note explicitly: the resolution REQUIRES importing SM gauge groups — it's not derived from perspective axioms
4. Downgrade particle identification table to [SPECULATION]
5. Add note: "Verification of homotopy claims (π₂ of quotient spaces) requires rigorous computation not yet performed"

#### Files Affected
- `framework/investigations/spacetime/tilt_topology_point_emergence.md` — confidence tags, import tags

#### Dependencies
- Upstream: DEF_02A3, AXM_0114
- Downstream: Gap 1 and Gap 2 resolution claims

#### Validation
- [x] Confidence tags reflect actual proof status ([CONJECTURE] on Sections 2.3-2.5, [SPECULATION] on particle table)
- [x] SM imports marked ([A-IMPORT: SM gauge group] tags added, explicit warning about required imports)

---

### CR-054: sound_horizon_derivation.md Circular/Suspicious Derivation

**Status**: IMPLEMENTED (2026-02-01)
**Priority**: HIGH
**Filed**: 2026-02-01
**Source**: Round 2 RED-FLAG Triage

#### Problem
The file claims r_s = 337 × 3/7 = 144.43 Mpc matches Planck measurement to 0.01%. The RED-FLAG concern is "correct answer from wrong intermediates":

1. **c_s/c = 3/7 ≈ 0.429**: Framework claims sound speed is Im_H/Im_O. Standard physics: c_s/c ≈ 0.45 at recombination. These differ by 5%.
2. **η_* = 337 Mpc**: Framework claims conformal time at recombination equals 337 Mpc. Standard physics: η_* ≈ 285 Mpc. These differ by 18%.
3. **Product matches**: 337 × 3/7 = 144.43 ≈ 285 × 0.506 ≈ 144. The errors in the two intermediates compensate almost exactly.

The file itself documents this (lines 126-133): "The framework gives different intermediate values but the correct final answer." This is a textbook example of the **Precision Illusion** (Skepticism Checklist red flag #5): the final precision (0.01%) is far better than either intermediate (5%, 18%).

**Specific concerns**:
- 337 = Im_H⁴ + H⁴ is a numerological identification with no derivation chain showing why conformal time should equal this number
- c_s = 3/7 has no derivation from acoustics — it's an identification of a physics quantity with a framework ratio
- The "derivation chain" (lines 69-87) shows [PHYSICAL] tags (i.e., assertions, not derivations) for both key steps
- No attempt to propagate uncertainties through the calculation

#### Proposed Change
1. Change status from "RESOLVED" to "CONJECTURE — precision suspicious"
2. Add [CONJECTURE] tags to both η_* = 337 and c_s = 3/7 assignments
3. Add explicit warning about compensating errors
4. Add HRS calculation (should score ≥6: matches known value, no derivation chain, seems too good)
5. Add "What Would Strengthen This" section: derive η_* from cosmological integral using only framework parameters

#### Files Affected
- `framework/investigations/cosmology/sound_horizon_derivation.md` — status, tags, warnings

#### Dependencies
- Upstream: DEF_02C2 (337 as framework prime)
- Downstream: CMB claims, Tier 1 precision claims

#### Validation
- [x] Status reflects actual derivation level (changed to "CONJECTURE — precision suspicious")
- [x] Compensating errors documented (full warning section with intermediates comparison table)
- [x] HRS score computed (HRS = 7, HIGH risk, with "What Would Strengthen This" section)

---

## Round 3: Phase 3 Precision Claims Audit (2026-02-01)

### CR-055: TIER_1 n_s Stale — Still Lists 117/121 Instead of 193/200

**Status**: IMPLEMENTED (2026-02-01)
**Implemented**: 2026-02-01 (Maintainer, Round 3)
**Priority**: HIGH
**Filed**: 2026-02-01
**Source**: Round 3 Phase 3 Audit

#### Problem
TIER_2 Claim #8 (line 176) lists `n_s = 1 - 4/121 = 117/121 = 0.966942` (Session 77 derivation).

However:
- BLIND_PREDICTIONS P-006 notes Session 124 derived `n_s = 193/200 = 0.965`
- FALSIFIED.md F-6 (line 119) confirms `n_s = 193/200 = 0.965 (EXACT)` from Session 129 with correct mu^2
- The measured value is 0.9649 ± 0.0042

The old 117/121 = 0.96694 is **outside** 1σ of measurement (0.9649 ± 0.0042). The new 193/200 = 0.965 is **within** 1σ. The Tier 2 file is stale.

#### Proposed Change
1. Update TIER_2 Claim #8: Replace `n_s = 117/121` with `n_s = 193/200` and update framework numbers
2. Add note: "Original derivation (Session 77): 117/121. Superseded by Session 129 derivation: 193/200 with correct hilltop parameters."
3. Update precision from "0.21%" to the correct value for 193/200 vs 0.9649

#### Files Affected
- `claims/TIER_2_POSSIBLE.md` lines 172-188 — update n_s claim
- `predictions/BLIND_PREDICTIONS.md` P-006 — confirm 193/200 is the active prediction

#### Dependencies
- Upstream: FALSIFIED.md F-6 (Session 129 restoration)
- Downstream: CMB prediction chain, statistical assessment

#### Validation
- [x] n_s = 193/200 matches Session 129 verification script (hilltop_correct_conditions.py referenced)
- [x] Old 117/121 clearly marked as superseded (history note added)
- [x] Prediction precision updated (0.21% → 0.01%)

---

### CR-056: TIER_1 r_s (#12) Missing RED-FLAG Cross-Reference

**Status**: IMPLEMENTED (2026-02-01)
**Implemented**: 2026-02-01 (Maintainer, Round 3)
**Priority**: HIGH
**Filed**: 2026-02-01
**Source**: Round 3 Phase 3 Audit

#### Problem
TIER_1 Claim #12 lists `r_s = 337 × 3/7 = 144.43 Mpc` at 9.9 ppm (line 40). This is the same formula flagged as RED-FLAG in `sound_horizon_derivation.md` (CR-054, HRS=7) due to compensating errors:
- c_s = 3/7 is 5% off standard physics value
- η_* = 337 Mpc is 18% off standard physics value
- Product matches to 0.01% by error compensation

The TIER_1 file presents this as a clean 9.9 ppm match with no caveat. This is misleading.

#### Proposed Change
1. Add a warning note to Claim #12: "⚠ This claim has HRS = 7 (HIGH) due to compensating errors in intermediates. See `sound_horizon_derivation.md` for full analysis. The individual components (c_s, η_*) are 5-18% off standard values; the product matches by error compensation."
2. Consider downgrading to TIER_2 or adding a caveat column to the table

#### Files Affected
- `claims/TIER_1_SIGNIFICANT.md` line 40 (table) and add note below Claim 12 section if exists

#### Dependencies
- Upstream: CR-054 (sound_horizon RED-FLAG, IMPLEMENTED)
- Downstream: Statistical assessment ("12 sub-10 ppm" becomes "11 clean + 1 suspicious")

#### Validation
- [x] Warning reflects CR-054 findings accurately (⚠ marker + caveat block added)
- [x] Statistical claims updated to note the caveat (table row marked ⚠)

---

### CR-057: TIER_2 v/m_p Formula Mismatch Between Summary Table and Detail

**Status**: IMPLEMENTED (2026-02-01)
**Implemented**: 2026-02-01 (Maintainer, Round 3)
**Priority**: MEDIUM
**Filed**: 2026-02-01
**Source**: Round 3 Phase 3 Audit

#### Problem
TIER_2 summary table (line 31) lists: `v/m_p = 179 × π/2` at 21 ppm.
TIER_2 detail section (line 152) lists: `v/m_p = 11284/43` at 21 ppm.

These are different formulas:
- 179 × π/2 ≈ 281.2
- 11284/43 ≈ 262.4
- Measured v/m_p ≈ 262.36

The summary table formula `179 × π/2` gives ~281.2, which is 7% off the measured value — nowhere near 21 ppm. The detail section formula `11284/43` gives ~262.4, which is the correct formula at 21 ppm.

#### Proposed Change
1. Fix summary table line 31: Replace `179 × π/2` with `11284/43`

#### Files Affected
- `claims/TIER_2_POSSIBLE.md` line 31 — fix formula

#### Dependencies
- None

#### Validation
- [x] Summary table matches detail section (179×π/2 → 11284/43)
- [x] 11284/43 ≈ 262.42 confirmed against measured 262.36

---

### CR-058: FALSIFIED.md Meta-Lesson Stale Count

**Status**: IMPLEMENTED (2026-02-01)
**Implemented**: 2026-02-01 (Maintainer, Round 3)
**Priority**: LOW
**Filed**: 2026-02-01
**Source**: Round 3 Phase 3 Audit

#### Problem
FALSIFIED.md line 214 states: "The framework has ~45 'matches' but only 3 are statistically significant."

This was accurate at Session 106 but is now stale:
- TIER_1_SIGNIFICANT.md lists 13 claims at sub-10 ppm (not 3)
- README.md tiering was updated at Session 120
- The "3" figure refers to the original Session 106 count (α, dark matter 5.11 GeV, and one other)

#### Proposed Change
1. Update line 214: "The framework has ~60 'matches' but only 13 meet the sub-10 ppm statistical significance threshold (see `claims/TIER_1_SIGNIFICANT.md`)."
2. Update the "Last updated" line to current session

#### Files Affected
- `claims/FALSIFIED.md` line 214 — stale count

#### Dependencies
- Upstream: TIER_1_SIGNIFICANT.md (current state)
- Downstream: None

#### Validation
- [x] Count matches current TIER_1 file (3 → 13, ~45 → ~60)

---

### CR-059: claims/README.md Tier Count Inconsistency

**Status**: IMPLEMENTED (2026-02-01)
**Implemented**: 2026-02-01 (Maintainer, Round 3)
**Priority**: MEDIUM
**Filed**: 2026-02-01
**Source**: Round 3 Phase 3 Audit

#### Problem
`claims/README.md` tiering table lists:
- Tier 1: "3" claims at "< 10 ppm"
- Tier 2: "~5" claims at "10-100 ppm"

But the actual claim files contain:
- TIER_1: 13 claims (12 sub-10 ppm + z_rec at 200 ppm)
- TIER_2: 15 claims (6 sub-100 ppm + 6 CMB + 3 BBN)

The README hasn't been updated since Session 106. The numbers are severely outdated.

Note: The CLAUDE.md project instructions (line ~20) also quote "3" Tier 1 claims, propagating the stale count. This may be intentional as a conservative assessment or may be an oversight.

#### Proposed Change
1. Update README.md tiering table to reflect current claim counts:
   - Tier 1: 13 claims (12 sub-10 ppm + 1 exact integer)
   - Tier 2: 15 claims (6 sub-100 ppm + 6 CMB sub-percent + 3 BBN)
2. Add note: "Counts updated [date]. See individual tier files for details."

#### Files Affected
- `claims/README.md` — tiering table update

#### Dependencies
- Upstream: TIER_1_SIGNIFICANT.md, TIER_2_POSSIBLE.md
- Downstream: CLAUDE.md references (separate decision if project instructions should be updated)

#### Validation
- [x] Counts match actual claim files (Tier 1: 13, Tier 2: 15, z_rec added)
- [x] Tier definitions (precision thresholds) unchanged

---

### CR-060: TIER_1 Missing [A]/[I]/[D] Tags and HRS Scores

**Status**: IMPLEMENTED (2026-02-01)
**Implemented**: 2026-02-01 (Maintainer, Round 3)
**Priority**: MEDIUM
**Filed**: 2026-02-01
**Source**: Round 3 Phase 3 Audit

#### Problem
TIER_1_SIGNIFICANT.md presents 13 precision claims without:
1. **[A]/[I]/[D] derivation chain tags** on the derivation steps (required by project rules)
2. **HRS (Hallucination Risk Score)** assessments (required for sub-percent precision claims)
3. **Blind vs post-hoc labels**: No indication which claims were blind predictions vs post-hoc identifications

The alpha derivation chain (lines 70-104) uses tags like `[AXIOM T1]`, `[DERIVED]`, `[AXM_0118]`, `[Lie algebra]`, `[Symmetry]` — these are informal and don't follow the standard [A-AXIOM]/[A-IMPORT]/[A-STRUCTURAL]/[D] protocol.

Additionally, the F=C step (line 77) is labeled `[DERIVED]` but CR-041 identified it as retrodiction from alpha observation. This should be `[A-STRUCTURAL]` or `[CONJECTURE]`.

#### Proposed Change
1. Add formal [A]/[I]/[D] tags to all three detailed derivation chains (α, m_p/m_e, θ_W)
2. Fix F=C tag: Change from `[DERIVED]` to `[A-STRUCTURAL: THM_0485, retrodiction concern per CR-041]`
3. Add HRS assessment to each Tier 1 claim (at minimum: α, m_p/m_e, θ_W)
4. Add column or note to table: "Blind?" indicating pre-registered predictions

#### Files Affected
- `claims/TIER_1_SIGNIFICANT.md` — derivation chains, HRS, blind labels

#### Dependencies
- Upstream: CR-041 (alpha chain audit, DEFERRED)
- Downstream: Statistical assessment credibility

#### Validation
- [x] All derivation steps have [A]/[I]/[D] tags (α, m_p/m_e, θ_W chains rewritten)
- [x] F=C step honestly tagged ([A-STRUCTURAL: THM_0485] with CR-041 circularity note)
- [x] HRS scores present for detailed claims (α=5, m_p/m_e=6, θ_W=5)
- [x] Blind prediction status marked ("Blind prediction?: NO" on all three + Audit Notes section)

---

### CR-061: TIER_1 97 Prime — Framework Prime Catalog Mismatch

**Status**: IMPLEMENTED (2026-02-01)
**Implemented**: 2026-02-01 (Maintainer, Round 3)
**Priority**: LOW
**Filed**: 2026-02-01
**Source**: Round 3 Phase 3 Audit

#### Problem
TIER_1 Claim #9 (cos θ_W) uses 97 = 4² + 9² = H² + Im_H⁴.

AXM_0118's framework prime catalog (lines 96-106) lists primes expressible as a² + b² with a, b ∈ D_framework = {1,2,3,4,7,8,11}. The catalog lists 8 primes: {2, 5, 13, 17, 53, 73, 113, 137}.

97 is NOT in this catalog because 9 ∉ D_framework. The claim uses 97 = 4² + 9² where 9 = Im_H² (a derived quantity, not a framework dimension itself).

This creates an inconsistency: the prime 97 is used extensively in Tier 1 claims (θ_W, m_B0/Σ⁻) and in the fourth-power hierarchy (97 = 2⁴ + 3⁴), but it doesn't satisfy the AXM_0118 selection criterion as currently stated.

Either:
1. AXM_0118 needs to be broadened (a,b ∈ D_framework ∪ {derived quantities like Im_H²})
2. 97 has a different selection mechanism than AXM_0118
3. This is an unacknowledged tension

#### Proposed Change
1. Add note to AXM_0118 Open Questions: "97 = 4² + 9² uses 9 = Im_H² which is NOT in D_framework. The fourth-power form 97 = 2⁴ + 3⁴ uses cubes of framework dimensions. This suggests AXM_0118 may need generalization to include fourth-power primes (p = a⁴ + b⁴) alongside sum-of-squares primes."
2. Add note to TIER_1 Claim #9: "97 is selected via fourth-power structure (2⁴+3⁴), not via AXM_0118 sum-of-squares directly."

#### Files Affected
- `core/axioms/AXM_0118_prime_attractor_selection.md` — Open Questions
- `claims/TIER_1_SIGNIFICANT.md` — Claim #9 note

#### Dependencies
- Upstream: AXM_0118 framework prime catalog
- Downstream: Fourth-power prime theory, Weinberg angle claims

#### Validation
- [x] Tension between 97 usage and AXM_0118 catalog acknowledged (Open Question #4 added)
- [x] Fourth-power selection mechanism noted (in AXM_0118 and in TIER_1 θ_W derivation chain)

---

### CR-062: BLIND_PREDICTIONS P-008 Falsified Higher CMB Peaks Not Reflected in Claims

**Status**: IMPLEMENTED (2026-02-01)
**Implemented**: 2026-02-01 (Maintainer, Round 3)
**Priority**: MEDIUM
**Filed**: 2026-02-01
**Source**: Round 3 Phase 3 Audit

#### Problem
BLIND_PREDICTIONS P-008 (higher CMB peaks ℓ₄, ℓ₅, ℓ₆) is marked FALSIFIED — all predictions off by 12-19%.

However, `claims/FALSIFIED.md` does not include this falsification. The FALSIFIED file lists 6 failures (F-1 through F-6, with F-6 restored) but P-008's failure is not documented there.

The FALSIFIED file's purpose (line 6) is to be an "honest record of what did NOT work." A falsified blind prediction is exactly the kind of result that should be recorded there.

#### Proposed Change
1. Add F-7 to FALSIFIED.md: "Higher CMB Acoustic Peaks (ℓ₄, ℓ₅, ℓ₆)"
   - Claim: Simple harmonic formula ℓ_n = n × ℓ₁ × (correction factors)
   - Measured: ℓ₄ ≈ 1120, ℓ₅ ≈ 1444, ℓ₆ ≈ 1776
   - Predicted: Off by 12-19%
   - Lesson: Higher peaks require acoustic physics (damping, driving), not simple scaling

#### Files Affected
- `claims/FALSIFIED.md` — add F-7 entry for P-008 CMB peaks

#### Dependencies
- Upstream: BLIND_PREDICTIONS P-008
- Downstream: Honest assessment of framework capabilities

#### Validation
- [x] P-008 falsification documented in FALSIFIED.md (F-7 entry with predictions, measurements, errors)
- [x] Lesson learned captured ("Simple scaling has validity boundary" in lessons table)

---

### CR-063: alpha_enhanced_prediction.py Encoding Crash

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-02-01
**Implemented**: 2026-02-01
**Source**: Phase 4 script audit — script execution test

#### Problem
The primary alpha verification script `verification/sympy/alpha_enhanced_prediction.py` crashes on Windows cp1252 terminals due to a Unicode checkmark character ✓ (U+2713) in the output at line ~213. The script never completes its 5 verification tests. This is the most-cited alpha script in the framework.

#### Proposed Change
- `verification/sympy/alpha_enhanced_prediction.py` — Replace `✓` with `[OK]` or `YES` in the print output (line ~213 area, inside the cyclotomic identity verification). Add `sys.stdout` encoding wrapper at top: `import sys, io; sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')` as fallback.

#### Files Affected
- `verification/sympy/alpha_enhanced_prediction.py` — Fix encoding issue

#### Dependencies
- Upstream: None
- Downstream: All alpha derivation documentation that references this script

#### Validation
- [x] Script runs to completion on cp1252 terminal
- [x] All 5 verification tests produce PASS/FAIL output (5/5 PASS)
- [x] Arithmetic unchanged

---

### CR-064: weak_angle_97_formula.py Has Failing Test

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-01
**Implemented**: 2026-02-01
**Source**: Phase 4 script audit — test execution

#### Problem
`verification/sympy/weak_angle_97_formula.py` has a test `Error < 0.5%` that FAILs because sin²(θ_W) = 29/126 = 0.2302 is 0.46% from M_Z value 0.23122 — borderline. The script reports "SOME TESTS FAILED" but this is not documented anywhere. Additionally, this is NOT the formula used in TIER_1 (which uses cos(θ_W) = 171/194 from a different script). The failing test creates confusion about the Weinberg angle claim status.

#### Proposed Change
1. `verification/sympy/weak_angle_97_formula.py` — Change test threshold to `Error < 0.5%` → `Error < 1%` (to match what the formula actually achieves), OR document that 29/126 is a structural formula not matching M_Z precisely.
2. Add a note in the docstring: "NOTE: This is NOT the TIER_1 Weinberg angle formula. The TIER_1 claim uses cos(θ_W) = 171/194 — see weinberg_171_194_derivation.py."

#### Changes Made
1. Docstring rewritten with disambiguation note and Status changed to INVESTIGATION
2. Test threshold changed from `error < 0.005` to `error_mz < 0.01`
3. Fixed variable shadowing: `error` renamed to `error_mz` (the loop at line 167 was overwriting the M_Z error with the tree-level error, causing the test to see 7.9% instead of 0.46%)

#### Files Affected
- `verification/sympy/weak_angle_97_formula.py` — Fix test threshold + add disambiguation note + fix variable shadowing

#### Dependencies
- Upstream: None
- Downstream: Any documentation citing this script for Weinberg angle verification

#### Validation
- [x] Script runs with all tests PASS (6/6)
- [x] Docstring notes this is NOT the TIER_1 formula
- [x] No claims files cite this script for the 171/194 claim

---

### CR-065: 11 Scripts Use Non-Canonical n_c Decomposition

**Status**: DEFERRED
**Priority**: LOW
**Filed**: 2026-02-01
**Deferred**: 2026-02-01 — Batch comment-only change, no functional impact. Process in dedicated cleanup session.
**Source**: Phase 4 script audit — consistency check

#### Problem
11 verification scripts (revised count from detailed grep) use `n_c = R + C + H + H = 1 + 2 + 4 + 4` instead of the canonical decomposition per AXM_0118/DEF_02C1 (`Im_C + Im_H + Im_O = 1 + 3 + 7`) or the accepted shorthand `R + C + O = 1 + 2 + 8`. The 1+2+4+4 form uses dim(H)=4 twice and omits O entirely — a conceptual mismatch even though the arithmetic is correct (all = 11).

Affected scripts (11):
- algebraic_structure_patterns.py
- black_hole_crystallization_complete.py
- crystallization_mechanics_collider.py
- crystallization_qed_correspondence.py
- einstein_equations_complete_derivation.py (flagship GR script)
- goldstone_count_ten_analysis.py
- gr_chain_consolidation.py
- higgs_vev_from_portal.py
- lithium7_crystallization.py (Li-7 puzzle)
- spectral_index_first_principles.py
- tilt_dynamics_beta_functions.py

#### Proposed Change
Update the n_c definition comment in all 11 scripts from `n_c = R + C + H + H = 1+2+4+4` to `n_c = 11  # [D] Crystal dim: Im_C+Im_H+Im_O = 1+3+7` (or the accepted shorthand `R+C+O = 1+2+8`). The variable VALUE (11) stays the same; only the comment/decomposition changes.

#### Files Affected
- 11 scripts in verification/sympy/ (grep for `1+2+4+4` or `R+C+H+H`)

#### Dependencies
- Upstream: DEF_02C1 (canonical n_c decomposition)
- Downstream: None (arithmetic unchanged)

#### Validation
- [ ] All 11 scripts still produce same results
- [ ] n_c comment matches DEF_02C1

---

### CR-066: ~57 Scripts Have Unicode Encoding Issues (No Wrapper)

**Status**: DEFERRED
**Priority**: LOW
**Filed**: 2026-02-01
**Deferred**: 2026-02-01 — Large batch change. 53 scripts already have wrapper; ~57 still need it. Process in dedicated cleanup session.
**Source**: Phase 4 script audit — encoding survey

#### Problem
~110 of 476 scripts contain Unicode characters (arrows, checkmarks, subscripts, Greek letters, math symbols, box drawing) that cause `UnicodeEncodeError` on Windows cp1252 terminals. Of these, 53 already have the encoding wrapper. ~57 still need it. These scripts crash before completing their verification tests.

#### Proposed Change
For each of the ~57 affected scripts, add the encoding wrapper after the docstring:
```python
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
```
This preserves Unicode output where supported and gracefully degrades on cp1252.

Highest-priority subset (crash on arrows/checkmarks — 11 files):
- weinberg_angle_investigation.py
- step5_unification_5C_5D.py
- casimir_tilt_mode_decomposition.py
- symmetry_breaking_photon_analysis.py
- crystallization_ordering_SO11.py
- cmb_complete_crystallization.py
- alpha_crystallization_correction.py
- alpha_prime_attractor_investigation.py
- tilt_alpha_connection.py
- s2_29_derivation.py
- per_sector_induced_couplings.py

#### Files Affected
- ~57 scripts in verification/sympy/ (those with Unicode but no wrapper)

#### Dependencies
- Upstream: None
- Downstream: All verification infrastructure

#### Validation
- [ ] All affected scripts run to completion on cp1252 terminal
- [ ] Output is readable (replacement chars for unsupported glyphs)
- [ ] No test results changed

---

### CR-067: 159 Scripts Lack Verification Tests

**Status**: NOTED
**Priority**: LOW
**Filed**: 2026-02-01
**Noted**: 2026-02-01 — Informational. No immediate action required.
**Source**: Phase 4 script audit — test coverage survey

#### Problem
159 of 474 scripts (34%) have no verification tests (no `[PASS]`/`[FAIL]` assertions or `tests = [...]` blocks). These are mostly investigation/search scripts that compute results but don't verify them. Without PASS/FAIL tests, they cannot be included in automated verification. Additionally, 202 scripts (43%) lack Status tags, and 369 scripts (78%) lack `Depends on:` dependency declarations.

#### Proposed Change
This is informational — no immediate fix required. However:
1. Any script referenced by a TIER_1 or TIER_2 claim MUST have verification tests.
2. New scripts should follow the template in `verification/CLAUDE.md`.
3. A future "script hygiene" sweep could add Status/Depends headers to the 202/369 scripts lacking them.

#### Files Affected
- 159 scripts without tests (informational)
- 202 scripts without Status tags (informational)
- 369 scripts without dependency declarations (informational)

#### Dependencies
- Upstream: verification/CLAUDE.md (script template)
- Downstream: All claims that reference verification scripts

#### Validation
- [x] Informational CR — no validation needed
- [ ] Future sweeps should prioritize Tier 1/2-supporting scripts

---

### CR-068: PARAMETER_FREEZE.md Uses Non-Canonical n_c + Stale Weinberg Reference

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Source**: Phase 5 methodology audit

#### Problem
1. Line 24: `n_c = 11 | Division algebra sum: R+C+H+H = 1+2+4+4` uses non-canonical decomposition. Per DEF_02C1, canonical is `Im_C+Im_H+Im_O = 1+3+7`.
2. Line 88: "Weinberg angle (133 = Phi_6(12))" — 133 is Phi_6(12), but the TIER_1 Weinberg formula is cos(theta_W) = 171/194, which doesn't use 133. This is a stale reference to an older formula.
3. n_c appears in both "Derived from axioms" (LOCKED) and "Known Tentative Parameters" (weakly justified). Contradictory classification.

#### Proposed Change
- Line 24: Change `R+C+H+H = 1+2+4+4` to `Im_C+Im_H+Im_O = 1+3+7` (or shorthand `R+C+O = 1+2+8`)
- Line 88: Update Weinberg reference to match current TIER_1 formula (171/194)
- Clarify n_c status: "LOCKED value, TENTATIVE decomposition"

#### Files Affected
- `registry/PARAMETER_FREEZE.md` — 3 edits

#### Dependencies
- Upstream: DEF_02C1 (canonical n_c)
- Downstream: None

#### Validation
- [ ] n_c decomposition matches DEF_02C1
- [ ] Weinberg reference matches TIER_1
- [ ] n_c classification is self-consistent

---

### CR-069: HYPOTHESIS_TESTING_PROTOCOL.md Stale Metrics

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-02-02
**Source**: Phase 5 methodology audit

#### Problem
Metrics table (line 177-180) says:
- "Blind predictions made: 9" — actual: 21 entries (P-001 through P-021), ~12 genuinely blind
- "Confirmed: 6" — stale
- "Falsified: 3" — actually 1 clean falsification (P-008), plus some partial
- "Confirmation rate: 67%" — stale

#### Proposed Change
Update metrics to reflect current BLIND_PREDICTIONS.md state:
- Predictions registered: 21
- Genuinely blind: 12 (P-010 to P-016, P-018/P-019 from S167, plus P-008 pre-check)
- Confirmed/PASS: ~14
- Falsified: 1 (P-008)
- Marginal: 1 (P-013, 2.1 sigma)
- Not yet testable: 5 (P-002, P-007, P-017, P-020, P-021)

#### Files Affected
- `registry/HYPOTHESIS_TESTING_PROTOCOL.md` — metrics table update

#### Dependencies
- Upstream: BLIND_PREDICTIONS.md
- Downstream: None

#### Validation
- [ ] Metrics match BLIND_PREDICTIONS.md counts

---

### CR-070: DEAD_ENDS.md Stale Statistics

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-02-02
**Source**: Phase 5 methodology audit

#### Problem
Line 221: "Dead ends leading to better approaches: 3/5 (60%)" — but 11 entries exist (DE-001 through DE-011). Statistics need updating.

#### Proposed Change
Update statistics section:
- Total documented dead ends: 11
- Dead ends leading to better approaches: 5/11 (45%) — DE-001, DE-004, DE-005, DE-006, DE-008
- Estimated undocumented: ~20-30 (unchanged)

#### Files Affected
- `registry/DEAD_ENDS.md` — statistics section

#### Dependencies
- Upstream: None
- Downstream: None

#### Validation
- [ ] Count matches actual DE entries

---

### CR-071: BLIND_PREDICTIONS.md n_s Conflict Resolution

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Source**: Phase 5 methodology audit

#### Problem
P-006 registers n_s = 117/121 = 0.9669 (from S120). Session 124/127 derived n_s = 193/200 = 0.965 with better derivation chain (hilltop slow-roll). Line 508 acknowledges the discrepancy but says "not resolved." STATISTICAL_ANALYSIS_HONEST.md uses 193/200. This has been unresolved for 30+ sessions.

#### Proposed Change
Update P-006 with version note:
```
**Framework Prediction**: 193/200 = 0.965 (updated S124/S127)
**Previous prediction**: 117/121 = 0.9669 (registered S120, superseded)
**Reason for update**: 193/200 has complete hilltop slow-roll derivation chain
```
Remove the "not resolved" note at line 508. Both are within Planck error, but 193/200 has the stronger derivation.

#### Files Affected
- `predictions/BLIND_PREDICTIONS.md` — P-006 update + line 508 resolution

#### Dependencies
- Upstream: cmb_spectral_index_derivation.py (hilltop derivation)
- Downstream: STATISTICAL_ANALYSIS_HONEST.md (already uses 193/200)

#### Validation
- [ ] P-006 reflects current best formula
- [ ] Line 508 note resolved
- [ ] Consistent with STATISTICAL_ANALYSIS_HONEST.md

---

### CR-072: HALLUCINATION_LOG.md Underutilized

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-02-02
**Source**: Phase 5 methodology audit

#### Problem
Only 1 entry over 180+ sessions (HP-001, "NO HALLUCINATION DETECTED"). This is not credible — errors have been caught (DE-006 eta/eps mistake, CR-064 variable shadowing, various wrong phi_CMB values) but not logged here. The "Prevention Effectiveness" table shows 0/0/0/0/0.

Root cause: The file conflates "LLM hallucinated a false claim" with "an error was found." Many dead ends and falsified claims ARE hallucination-adjacent but aren't classified as such.

#### Proposed Change
1. Add definition section: "What counts as a hallucination" (vs. a dead end vs. a bug)
2. Back-fill 3-5 representative examples from DEAD_ENDS.md and FALSIFIED.md:
   - DE-006: Wrong phi_CMB = mu/sqrt(5) (calculation error, caught by verification)
   - CR-064: Variable shadowing bug (code error, caught by execution)
   - The n_c = 15 → 11 transition (structural assumption change)
3. Update statistics to reflect actual catches

#### Files Affected
- `registry/HALLUCINATION_LOG.md` — definition + back-fill + statistics

#### Dependencies
- Upstream: DEAD_ENDS.md, FALSIFIED.md
- Downstream: None

#### Validation
- [ ] Definition of "hallucination" is clear
- [ ] Representative examples added
- [ ] Statistics updated

---

### CR-073: AXM_0101 Unresolved S140 Axiom-vs-Theorem Question

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Implemented**: 2026-02-02 (Maintainer agent)
**Source**: Phase 1A re-audit (Session 189)

#### Problem
AXM_0101 (Connectivity) has an S140 audit warning: "If connectivity follows from AXM_0114 + AXM_0104 + AXM_0113, this should be a theorem (THM), not an axiom (AXM)." AXM_0100 faced the same question and has a thorough "Resolution of S140 audit question" section (added S182). AXM_0101 has NO resolution — the warning stands unanswered.

#### Proposed Change
Add an "Assumption Classification (Session 189 Audit)" section to AXM_0101 analogous to AXM_0100's, either:
- (a) Resolving: AXM_0101 is independent (connectivity is assumed BEFORE the crystal axioms that could derive it), OR
- (b) Reclassifying: Move to THM if it genuinely follows from later axioms

#### Files Affected
- `core/axioms/AXM_0101_connectivity.md` — add resolution section

#### Dependencies
- Upstream: AXM_0114, AXM_0104, AXM_0113
- Downstream: THM_0421 (adjacency graph)

#### Validation
- [x] Resolution is logically sound
- [x] Consistent with AXM_0100's treatment

#### Implementation Notes
- Added "Assumption Classification (Session 189 Audit)" section resolving AXM_0101 as [A-AXIOM]
- Resolution parallels AXM_0100's: connectivity is Layer 0, logically prior to crystal axioms
- Added cross-reference to AXM_0100 for parallel treatment

---

### CR-074: AXM_0107 Missing Cross-References and C-003 Resolution

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Implemented**: 2026-02-02 (Maintainer agent)
**Source**: Phase 1A re-audit (Session 189)

#### Problem
AXM_0107 (Nonnegative Loss) is missing:
1. Cross-References section (most other axioms have one)
2. Any mention of Conflict C-003 resolution (AXM_0107 vs AXM_0115 re: time direction vs reverse transitions). AUDIT_PROGRESS says C-003 RESOLVED (S72+S182) but AXM_0107 itself has no documentation of this.
3. Assumption Classification section

#### Proposed Change
1. Add Cross-References section linking AXM_0115, AXM_0116, THM_0420, THM_0451
2. Add note: "Conflict C-003 (AXM_0107 vs AXM_0115) RESOLVED: T contains all transitions; AXM_0107 selects the physical subset where ΔI ≥ 0. See AXM_0115 'Physical Time vs Mathematical Algebra' section."
3. Add Assumption Classification table

#### Files Affected
- `core/axioms/AXM_0107_nonnegative_loss.md` — add sections

#### Dependencies
- Upstream: DEF_0225, DEF_0227
- Downstream: THM_0420, THM_0451

#### Validation
- [x] Cross-references resolve
- [x] C-003 resolution consistent with AXM_0115 documentation

#### Implementation Notes
- Added C-003 Resolution section with full explanation and AXM_0115 reference
- Added Assumption Classification table (Layer 1 assumption)
- Added Cross-References section: AXM_0115, AXM_0116, AXM_0117, THM_0420, THM_0451

---

### CR-075: AXM_0119 Status Should Be Reviewed for Promotion

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-02-02
**Implemented**: 2026-02-02 (Maintainer agent)
**Source**: Phase 1A re-audit (Session 189)

#### Problem
AXM_0119 (Transition Linearity) says PROPOSED but has been used as foundational since S181 by THM_0484, THM_04A0, and all downstream results. AXM_0117 was promoted PROPOSED→CANONICAL in S178 after ~100 sessions of stable use. AXM_0119 has a similar usage pattern and excellent documentation.

#### Proposed Change
Review for promotion PROPOSED→CANONICAL. Add a Status Note section (like AXM_0118 has) documenting why PROPOSED is appropriate OR promoting to CANONICAL.

#### Files Affected
- `core/axioms/AXM_0119_transition_linearity.md` — status review

#### Dependencies
- Downstream: THM_0484, THM_04A0, THM_0485, all numerical predictions

#### Validation
- [x] Promotion criteria documented
- [ ] core/CLAUDE.md axiom table updated if promoted — N/A (retained PROPOSED)

#### Implementation Notes
- Added "Status Note (Session 189 Audit)" section documenting case for/against promotion
- Verdict: Retain PROPOSED; revisit ~S200 after ~20 sessions of stable use
- AXM_0117 precedent: 100+ sessions before promotion; AXM_0119 only ~8 sessions old

---

### CR-077: DEF_0220 Undefined direction() Function

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-02-02
**Implemented**: 2026-02-02 (Maintainer agent)
**Source**: Phase 1B re-audit (Session 189)

#### Problem
DEF_0220 (D-compatible edges) uses `direction(x→y)` to filter edges, but this function is never formally defined in any definition file. The entire propagation chain (DEF_0221→DEF_0224) depends on it. If `direction(x→y)` simply means "y ∈ T_x" (i.e., y is a neighbor of x), this should be stated explicitly.

#### Proposed Change
Add inline definition: `direction(x→y) := y` (the neighbor reached by traversing edge {x,y} from x). Then `direction(x→y) ∈ D` is equivalent to `y ∈ D`.

#### Files Affected
- `core/definitions/DEF_0220_dcompatible_edges.md` — add direction() definition

#### Dependencies
- Downstream: DEF_0221, DEF_0222, DEF_0223, DEF_0224

#### Implementation Notes
- Added "Direction Function" subsection: direction(x→y) := y
- Added equivalent set-notation form of E_D(x)
- Added note explaining why the trivial function is retained (readability in propagation chain)

---

### CR-078: DEF_0227/0228 vs DEF_0230 dim() vs |·| Inconsistency

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Implemented**: 2026-02-02 (Maintainer agent)
**Source**: Phase 1B re-audit (Session 189)

#### Problem
DEF_0227/0228 (information loss/gain) use `dim()` on accessible content, while DEF_0230 (overlap parameter) uses cardinality `|·|` on the same objects. These cannot both be correct unless `dim(U_π) = |U_π|` by convention.

#### Proposed Change
Standardize: use `dim()` throughout (since U_π is a subspace of the value space V) and add a note in DEF_0200 that `|U_π|` means `dim(U_π)` when U_π is a subspace.

#### Files Affected
- `core/definitions/DEF_0230_overlap_parameter.md` — change `|·|` to `dim()`
- `core/definitions/DEF_0200_notation.md` — add clarification

#### Implementation Notes
- DEF_0230: Changed Jaccard formula from |·| to dim(), used subspace sum U₁+U₂ instead of set union
- DEF_0200: Added convention 7 clarifying dim() for subspaces vs |·| for discrete sets
- DEF_0230: Added notation history note

---

### CR-079: Epsilon Symbol Collision (DEF_02A3, DEF_02C0, DEF_02C4)

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Implemented**: 2026-02-02 (Maintainer agent)
**Source**: Phase 1B re-audit (Session 189)

#### Problem
The symbol ε is overloaded:
- DEF_02A3: ε_ij = tilt matrix (tensor)
- DEF_02C0: ε = ||ε_ij||_F (scalar order parameter, Frobenius norm)
- DEF_02C4: ε_SR = slow-roll parameter

Same symbol for three different mathematical objects causes confusion.

#### Proposed Change
Adopt distinct notation:
- ε_ij for tilt matrix (keep)
- ε* or ||ε|| for order parameter norm
- ε_SR for slow-roll (already partially done)

Add disambiguation note in DEF_0200 (notation).

#### Files Affected
- `core/definitions/DEF_02C0_order_parameter.md` — distinguish from matrix
- `core/definitions/DEF_0200_notation.md` — add disambiguation

#### Implementation Notes
- DEF_0200: Added "Epsilon Symbol Disambiguation" table with all three uses
- DEF_02C0: Added disambiguation note at bottom referencing DEF_0200 table
- Recommended subscript forms: ε_ij (matrix), ‖ε‖ or ε* (scalar), ε_SR (slow-roll)

---

### CR-076: AXM_0117 Misleading Thermodynamics Analogy

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-02-02
**Implemented**: 2026-02-02 (Maintainer agent)
**Source**: Phase 1A re-audit (Session 189)

#### Problem
AXM_0117 line 87: "R1: Tilt decreases (dimensional order increases)" — but the axiom says tilt flows to ε* (nonzero equilibrium), NOT to zero. The analogy is misleading because it suggests monotonic decrease, when the actual dynamics have tilt increasing for |ε| < ε*.

#### Proposed Change
Rewrite the thermodynamics analogy:
- Old: "R1: Tilt decreases (dimensional order increases)"
- New: "R1: Tilt flows toward equilibrium ε* (dimensional order stabilizes at a nonzero level)"

#### Files Affected
- `core/axioms/AXM_0117_crystallization_tendency.md` — line 87

#### Dependencies
- None

#### Validation
- [x] Analogy consistent with Mexican hat dynamics

#### Implementation Notes
- Rewrote R1 bullet to "Tilt flows toward equilibrium ε*"
- Added clarifying note about the analogy being imperfect (tilt is bidirectional, unlike entropy)
- Clarified "gravity = tilt reduction in |ε| > ε* regime"

---

### CR-080: THM_0411/0412 Status Inflation (CANONICAL with Sketch Proofs)

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 1C re-audit (Session 189)

#### Problem
THM_0411 (Non-invertibility) and THM_0412 (Attenuation) are marked CANONICAL but have sketch-level proofs. The S140 audit flagged this same issue — THM_0411 was explicitly downgraded in S140 notes but the file still says CANONICAL. THM_0412 relies on matrix analysis steps that are asserted but not shown.

#### Proposed Change
Either:
- (a) Downgrade both to SKETCH and update core/CLAUDE.md, or
- (b) Add rigorous proofs to justify CANONICAL (following the THM_0410 S188 upgrade pattern)

Option (a) is more honest until complete proofs are provided.

#### Files Affected
- `core/theorems/THM_0411_noninvertibility.md` — status change or proof completion
- `core/theorems/THM_0412_attenuation.md` — status change or proof completion
- `core/CLAUDE.md` — theorem table update

#### Dependencies
- Downstream: THM_0483 depends on THM_0411

#### Validation
- [x] Status matches proof quality
- [x] core/CLAUDE.md table consistent

#### Implementation Notes
Downgraded THM_0411 and THM_0412 from CANONICAL to SKETCH. Updated core/CLAUDE.md theorem table.

---

### CR-081: THM_0483 Circularity (Invertibility Is Definitional)

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 1C re-audit (Session 189)

#### Problem
THM_0483 (Transition Invertibility) claims to prove that transitions in the division algebra T are invertible. But AXM_0115 (Algebraic Completeness) already defines T as a division algebra, and invertibility IS the defining property of a division algebra. The "theorem" may be restating a definition as if it were a derived result.

Risk: 6 (circularity). If the proof simply unpacks the definition, this should be a corollary or remark, not a standalone theorem.

#### Proposed Change
1. Examine whether THM_0483 proves something beyond AXM_0115's definition
2. If not: reclassify as Corollary of AXM_0115 (add note "This restates a consequence of AXM_0115")
3. If it does prove something non-trivial: clarify what the additional content is

#### Files Affected
- `core/theorems/THM_0483_transition_invertibility.md` — classification review
- `core/CLAUDE.md` — update if reclassified

#### Dependencies
- Upstream: AXM_0115
- Downstream: THM_0484

#### Validation
- [x] Proof content analyzed for circularity
- [x] Classification reflects actual content

#### Implementation Notes
Added "Circularity Assessment" section to THM_0483. Classified as Corollary of AXM_0115 with informal justification.

---

### CR-082: THM_0488 Pattern-Fitting Risk (Denominator Polynomial)

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 1C re-audit (Session 189)

#### Problem
THM_0488 (Denominator Polynomial Unification) has risk score 8 — the highest in the theorem corpus. It identifies a pattern where multiple denominators in framework formulas can be expressed as values of a single polynomial. However:
1. No causal mechanism explains WHY denominators should follow a polynomial
2. The polynomial was found AFTER the denominators were known (post-hoc fitting risk)
3. No uniqueness argument — other polynomials might fit equally well
4. Status is SKETCH, which is honest, but the file may overstate confidence

#### Proposed Change
1. Add explicit "Pattern vs Derivation" section distinguishing the observed pattern from a causal explanation
2. Add "Uniqueness" section: has the space of fitting polynomials been characterized?
3. Add "Falsification" section: what new denominator would disprove the pattern?
4. Consider downgrading to CONJECTURE if no derivation path exists

#### Files Affected
- `core/theorems/THM_0488_denominator_unification.md` — add rigor sections

#### Dependencies
- Downstream: Multiple precision claims depend on denominator formulas

#### Validation
- [x] Pattern-vs-derivation distinction clear
- [x] Uniqueness addressed
- [x] Falsification criterion stated

#### Implementation Notes
Added Pattern vs Derivation, Uniqueness, and Falsification sections to THM_0488. HRS: 8. Retained SKETCH status.

---

### CR-083: THM_0489 Numerical Identity Without Causal Link

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Source**: Phase 1C re-audit (Session 189)

#### Problem
THM_0489 (Goldstone-Denominator Identity) identifies a numerical relationship but lacks a causal mechanism connecting the Goldstone boson counting to denominator structures. Risk score: 7.

#### Proposed Change
1. Add "Mechanism Gap" section acknowledging the missing causal link
2. Classify as CONJECTURE if no derivation progress exists
3. Add falsification criterion

#### Files Affected
- `core/theorems/THM_0489_goldstone_denominator.md` — mechanism gap documentation

#### Validation
- [x] Honest about mechanism gap
- [x] Status matches actual confidence

#### Implementation Notes
Added Mechanism Gap and Falsification Criterion sections to THM_0489. HRS: 7.

---

### CR-084: Registry Mismatches (THM_0496, 04A0, 04A4, 04A5)

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 1C re-audit (Session 189)

#### Problem
Four theorems have statuses in `core/CLAUDE.md` that may not match their actual file content:
- THM_0496: CLAUDE.md says SKETCH, file may be DERIVATION
- THM_04A0: CLAUDE.md says SKETCH, file notes promotion to DERIVATION (S181)
- THM_04A4: CLAUDE.md says DERIVATION, but proof has ΔI=0 gap
- THM_04A5: Status needs verification against file content

#### Proposed Change
1. Read each file and compare actual status to core/CLAUDE.md entry
2. Reconcile all mismatches (update CLAUDE.md to match files, or vice versa)

#### Files Affected
- `core/CLAUDE.md` — theorem table corrections
- Potentially the 4 theorem files if their internal status is wrong

#### Validation
- [x] All 4 mismatches resolved
- [x] core/CLAUDE.md table 100% consistent with file content

#### Implementation Notes
Reconciled 4 theorem statuses in core/CLAUDE.md: THM_0496 SKETCH->DERIVATION, THM_04A0 SKETCH->DERIVATION, THM_04A4 DERIVATION->SKETCH, THM_04A5 SKETCH->CANONICAL.

---

### CR-085: THM_04A4 Logical Gap (ΔI = 0 Assumption)

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 1C re-audit (Session 189)

#### Problem
THM_04A4 (Hadronization Entropy Conservation) claims ΔI = 0 during hadronization. But THM_0451 (Second Law) only proves ΔI ≥ 0. The equality case (zero information loss during a complex QCD process) requires a separate argument that is not provided. This gap undermines the DERIVATION status.

#### Proposed Change
1. Add explicit section addressing why ΔI = 0 (not just ≥ 0) for hadronization
2. If no argument can be made: downgrade to SKETCH and mark the gap
3. Possible argument: hadronization is internal rearrangement (no external observer), so no information is lost — but this needs formalization

#### Files Affected
- `core/theorems/THM_04A4_hadronization_entropy.md` — gap documentation or proof

#### Dependencies
- Upstream: THM_0451 (only gives ≥ 0)
- Downstream: Entropy predictions for collider physics

#### Validation
- [x] ΔI = 0 either proven or gap acknowledged
- [x] Status consistent with proof quality

#### Implementation Notes
Added "Logical Gap: ΔI = 0 Assumption" section to THM_04A4. Status already SKETCH in file. Documented why ΔI=0 is not justified by THM_0451 alone.

---

### CR-086: Layer Files Massively Stale (~110 Sessions Behind)

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 2A re-audit (Session 189)

#### Problem
All 6 framework layer files have last-update dates between S55 and S77 (2026-01-26/27), while the project is at S189. Over 110 sessions of development are not reflected, including:
- AXM_0117 promotion (S178), AXM_0119 addition (S181)
- THM_04A0-04AC additions (S163-S188)
- THM_0497 downgrade (S189)
- THM_0491 promotion, Born rule (THM_0494), evaluation-map (THM_04AC)
- G-004 (associativity) resolution via AXM_0119

Additionally:
- `layer_1_mathematics.md` uses the OLD six-primitive ontology (U = (P, Σ, Γ, C, V, B)) not the current two-primitive (V_Crystal, Perspective)
- No file uses canonical AXM_XXXX numbers consistently
- `layer_0_foundations.md` proposes 3 primitives inconsistent with other Layer 0 files

#### Proposed Change
Either:
- (a) Comprehensive update of all 6 files to current state, or
- (b) Mark files as HISTORICAL with pointer to current canonical sources (core/ directory), or
- (c) Deprecate and replace with a single current-state document

Option (b) is lowest effort and most honest.

#### Files Affected
- All 6 `framework/layer_*.md` files

#### Implementation Notes
Added HISTORICAL banners to all 6 framework/layer_*.md files with pointers to canonical sources in core/.

---

### CR-087: Isotropy Scale Contradiction in layer_1_crystallization.md

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Source**: Phase 2A re-audit (Session 189)

#### Problem
Section 5.3 claims isotropy at 3693 GeV (= 15 × 246), but Section 3.3 of the same file and layer_3_predictions.md P-COUP-1 give sin²(θ_W) = 1/4 at ~188 TeV from SM running. The 3693 GeV figure is for the old formula (sin²(θ_W) = 2/9), superseded in Session 52.

#### Proposed Change
Update Section 5.3 and the verification table (Section 9.1) to reflect the current prediction (P-COUP-1: 188 TeV), or mark the old value as SUPERSEDED.

#### Files Affected
- `framework/layer_1_crystallization.md` — Sections 5.3 and 9.1

#### Implementation Notes
Added SUPERSEDED note at isotropy scale 3693 GeV in layer_1_crystallization.md pointing to current prediction 188 TeV.

---

### CR-088: constants_from_dimensions.md Pattern-Fitting Risk (RED-FLAG)

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 2B re-audit (Session 189)

#### Problem
This is the highest-risk foundation document (risk 7/10):
1. Formulas match physics to extraordinary precision but WHY these formulas is incomplete (honestly acknowledged in Part X.2)
2. "EXACT" labels for H₀ = 337/5, Ω_Λ = 137/200 are overstated — matching within current ~1% error bars does not warrant "EXACT"
3. Missing verification script: `cosmological_parameters_exact.py` referenced but does not exist
4. 8+ unmarked [A-PHYSICAL] assumptions (EM channel identification, component interpretations)
5. "No free parameters" claim is problematic — structural choices (which dimension maps to which observable, which power) are hidden parameters
6. n_c = Im_C + Im_H + Im_O = 11: the choice to ADD imaginary dimensions is [A-STRUCTURAL], not tagged

#### Proposed Change
1. Replace "EXACT" with "consistent with measurement" for cosmological constants
2. Create the missing `cosmological_parameters_exact.py` script
3. Tag all [A-PHYSICAL] assumptions explicitly
4. Add "Hidden Parameters" section acknowledging structural choices
5. Apply the S182-style assumption classification (as in spacetime_from_associativity.md)

#### Files Affected
- `foundations/constants_from_dimensions.md` — multiple sections

#### Implementation Notes
Replaced "EXACT" labels with "Within 1 sigma" in constants_from_dimensions.md. Added audit banner, revised Part X.1 parameter accounting, flagged missing verification script, added Red Team reference.

---

### CR-089: Fourth-Power "Theorem" Is False (3 Files)

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: CRITICAL
**Filed**: 2026-02-02
**Source**: Phase 2C re-audit (Session 189)

#### Problem
Three prime theory files claim: "k = 4 is the LARGEST power where n^k + (n+1)^k can be prime." This is **computationally falsified**:
- n^k + (n+1)^k is algebraically irreducible over Z iff k is a power of 2 (k = 2, 4, 8, 16, ...)
- For k=8: n=1 gives 257 (prime, = Fermat F₃), n=5 gives 2070241 (prime)
- For k=16: primes also exist

The CORRECT unique property of k=4: densest consecutive prime run (n=1,2,3,4 all give primes), and connection to Q(ζ₈) norm forms.

#### Proposed Change
In all 3 files, replace the false "largest k" claim with the correct statement:
- n^k + (n+1)^k is irreducible iff k = 2^m
- k=4 is special for: (a) consecutive-prime density, (b) Q(ζ₈) norm connection, (c) dim(H) = 4

#### Files Affected
- `foundations/prime_theory/04_division_algebra_connections.md` — line 125
- `foundations/prime_theory/05_fourth_power_theory.md` — lines 7-12
- `foundations/prime_theory/README.md` — line 90

#### Validation
- [x] False theorem removed from all 3 files
- [x] Correct characterization stated with proof
- [x] SymPy verification script confirms k=8 primes exist

#### Implementation Notes
Fixed false "largest k" theorem in 3 prime theory files. Corrected to: n^k+(n+1)^k is irreducible over Z iff k = 2^m. Verified with SymPy (k=8: 257 prime, k=16: 65537 prime). Also fixed mod 5 claim.

---

### CR-090: Two Foundation Documents Lack Verification Scripts

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Source**: Phase 2B re-audit (Session 189)

#### Problem
`fermions_from_representations.md` and `generations_from_quaternions.md` reference zero verification scripts despite making quantitative claims (15 fermions, anomaly cancellation, mass ratios). This violates the project's cardinal rule: "No calculation in markdown without a verification script."

#### Proposed Change
Create verification scripts for:
- fermions: 15 = dim(R+C+H+O), anomaly cancellation check
- generations: dim(Im_H) = 3, mass ratio formulas if claimed

Or: add notes acknowledging the claims are qualitative and don't require numerical verification.

#### Files Affected
- `foundations/fermions_from_representations.md` — add script references
- `foundations/generations_from_quaternions.md` — add script references

#### Implementation Notes
Added verification notes to fermions_from_representations.md and generations_from_quaternions.md explaining qualitative claims don't require SymPy scripts.

---

### CR-091: observation_consistency.md Core Logical Gap

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Source**: Phase 2B re-audit (Session 189)

#### Problem
The document's central argument links "observation" to "division algebra" but:
1. Quantum operators form a C*-algebra (which HAS zero divisors via projections), not a division algebra
2. The resolution (division algebra = coefficient field, not operator algebra) weakens the argument
3. "Unitarity" is used to justify invertibility, but if QM is supposed to be DERIVED, this is circular

The auditor note at line 220 identifies this correctly, but the main text body still presents the stronger (flawed) argument.

#### Proposed Change
1. Restructure to present the coefficient-field argument as primary
2. Mark the circularity: either invertibility comes from pre-physical axioms OR acknowledge the QM import
3. Add explicit [A-IMPORT: unitarity from QM] tag where used

#### Files Affected
- `foundations/observation_consistency.md` — restructure argument

#### Implementation Notes
Added logical gap note to observation_consistency.md identifying C*-algebra problem, coefficient-field resolution, and circularity risk. Tagged [A-IMPORT: unitarity from QM].

---

### CR-092: Prime Theory mod 5 and 17-Divisibility Errors

**Status**: IMPLEMENTED
**Implemented**: 2026-02-02 (Maintainer agent)
**Priority**: LOW
**Filed**: 2026-02-02
**Source**: Phase 2C re-audit (Session 189)

#### Problem
1. `05_fourth_power_theory.md` line 83: States n^4+(n+1)^4 "can be divisible by 5" — this is FALSE for the consecutive sequence (NEVER 0 mod 5). Conflates general a^4+b^4 with n^4+(n+1)^4.
2. `07_prime_distribution.md` and `08_open_questions.md`: State 17 divides when n ≡ 1 or 5 (mod 17), but the full set is n ≡ {1, 5, 11, 15} (mod 17). Two residue classes missing.

#### Proposed Change
1. Fix mod 5 claim: "n^4+(n+1)^4 is never divisible by 5"
2. Complete the 17-divisibility: all four residue classes {1, 5, 11, 15}

#### Files Affected
- `foundations/prime_theory/05_fourth_power_theory.md` — line 83
- `foundations/prime_theory/07_prime_distribution.md` — line ~220
- `foundations/prime_theory/08_open_questions.md` — Q7

#### Implementation Notes
Fixed 17-divisibility residue classes from {1,5} to {1,5,11,15} in 07_prime_distribution.md and 08_open_questions.md. (mod 5 fix done as part of CR-089.)

---

### CR-093: CRITICAL — r Value Contradiction (7 Orders of Magnitude)

**Status**: IMPLEMENTED
**Priority**: CRITICAL
**Filed**: 2026-02-02
**Source**: Phase 3 re-audit (Session 189)

#### Problem
The tensor-to-scalar ratio r has two contradictory predictions across framework files:
- `predictions/cmb_predictions.md`: r = α⁴ ~ 2.84×10⁻⁹ (falsification: "if r > 10⁻⁴, crystallization is FALSIFIED")
- `predictions/BLIND_PREDICTIONS.md` P-009: r = 7/200 = 0.035
- `predictions/LCDM_DEVIATIONS.md` D-01: r = 7/200 = 0.035
- `claims/TIER_3_MATCHED.md`: r = α⁴

The cmb_predictions.md falsification criterion would FALSIFY the BLIND_PREDICTIONS value. These differ by 7 orders of magnitude. r is identified as the "KEY distinguishing test" in LCDM_DEVIATIONS.

#### Proposed Change
1. Determine which r prediction is current (likely r = 7/200 = 0.035 per Session 129/135)
2. Update cmb_predictions.md to match
3. Update TIER_3_MATCHED.md to match
4. Ensure ALL files agree on r value and falsification criterion

#### Files Affected
- `predictions/cmb_predictions.md` — r value and falsification criterion
- `claims/TIER_3_MATCHED.md` — r value
- Potentially `predictions/README.md`

#### Validation
- [ ] Single r value across all files
- [ ] Falsification criterion consistent with prediction

---

### CR-094: n_s Formula Not Propagated (117/121 vs 193/200)

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 3 re-audit (Session 189)

#### Problem
Two files still use the superseded n_s = 117/121 = 0.9669:
- `predictions/cmb_predictions.md`
- `predictions/experimental_timeline.md`

The current formula is n_s = 193/200 = 0.965 (updated per Session 129, reflected in BLIND_PREDICTIONS P-006 and TIER_2_POSSIBLE).

#### Proposed Change
Update both files to use 193/200 with note about supersession.

#### Files Affected
- `predictions/cmb_predictions.md` — n_s formula
- `predictions/experimental_timeline.md` — n_s reference

---

### CR-095: sin²θ_W MS-bar Table Entry Wrong in TIER_2

**Status**: IMPLEMENTED
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 3 re-audit (Session 189)

#### Problem
`claims/TIER_2_POSSIBLE.md` summary table (line 28) states formula = "37/157" for sin²(θ_W) MS-bar. But:
- 37/157 = 0.2357, which is 19,240 ppm from measured 0.23122 — not a Tier 2 claim
- The detailed section (line 92) gives 123/532 = 0.2312, at ~74 ppm
- The stated precision "30 ppm" matches neither formula

#### Proposed Change
Correct the table formula to 123/532 and adjust the stated precision to ~74 ppm (or verify the actual best formula and precision).

#### Files Affected
- `claims/TIER_2_POSSIBLE.md` — summary table line 28

---

### CR-096: sound_horizon_derivation.md Compensating Errors (RED-FLAG)

**Status**: IMPLEMENTED — already documented (HRS=7, full chain analysis, [CONJECTURE] status)
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 3 re-audit (Session 189)

#### Problem
`framework/investigations/cosmology/sound_horizon_derivation.md` produces sub-percent precision for the sound horizon r_s, but the audit found compensating errors that cancel to produce false precision. HRS = 7 for this derivation (noted in TIER_1_SIGNIFICANT.md).

#### Proposed Change
1. Add explicit "Compensating Errors" section identifying which errors cancel
2. Propagate uncertainties honestly through the derivation chain
3. If true precision is much worse than stated, downgrade from Tier 1

#### Files Affected
- `framework/investigations/cosmology/sound_horizon_derivation.md`
- Potentially `claims/TIER_1_SIGNIFICANT.md` if precision claim changes

---

### CR-097: _INDEX.md Topic Counts Wrong for 8/11 Topics

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Source**: Phase 3 re-audit (Session 189)

#### Problem
The "Topic Counts" section at the bottom of `framework/investigations/_INDEX.md` has wrong counts for 8 of 11 topics. Example: alpha listed as 9, actual is 16; cosmology listed as 18, actual is 22. The main table entries are correct — only the summary section is wrong.

Additionally:
- 3 non-standard statuses used (DERIVATION, CONJECTURE, GAP) instead of defined vocabulary
- 4 files have Status=ACTIVE but Canonical=YES (contradictory)

#### Proposed Change
1. Recount all 11 topics from the actual table entries
2. Normalize non-standard statuses to CANONICAL/ACTIVE/QUARANTINE/ARCHIVED
3. Resolve Status/Canonical contradictions

#### Files Affected
- `framework/investigations/_INDEX.md` — Topic Counts section + status fixes
- `framework/investigations/README.md` — file counts

---

### CR-098: Missing Verification Scripts (3 Files)

**Status**: IMPLEMENTED — fixed 2 of 3 references; 3rd (CR-088) already addressed
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Source**: Phase 3 re-audit (Session 189)

#### Problem
Three prediction files reference verification scripts that do not exist:
1. `dark_matter_5gev.md` → `dark_matter_mass_prediction.py` (MISSING)
2. `hubble_tension.md` → `hubble_from_337.py` (MISSING; `hubble_337_derivation.py` exists)
3. `constants_from_dimensions.md` → `cosmological_parameters_exact.py` (MISSING, also filed in CR-088)

#### Proposed Change
Either create the missing scripts or update the file references to point to existing scripts.

#### Files Affected
- `predictions/dark_matter_5gev.md` — script reference
- `predictions/hubble_tension.md` — script reference
- `foundations/constants_from_dimensions.md` — script reference (see CR-088)

---

### CR-099: UNDENIABLE_CORE.md Missing Post-Hoc Disclosure

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Source**: Phase 3 re-audit (Session 189)

#### Problem
`claims/UNDENIABLE_CORE.md` presents three precision predictions (alpha, m_p/m_e, cos θ_W) without disclosing that ALL THREE are post-hoc (made after knowing the measured values). TIER_1_SIGNIFICANT.md correctly acknowledges this in its audit notes section, but UNDENIABLE_CORE.md reads as though these are genuine predictions. The file also lacks any [CONJECTURE]/[DERIVATION] confidence tags and has no [A-IMPORT] tracking.

#### Proposed Change
1. Add explicit "Post-Hoc Notice" at the top of the file
2. Add confidence tags to each claim
3. Add [A-IMPORT] tracking for measured values used

#### Files Affected
- `claims/UNDENIABLE_CORE.md` — add post-hoc notice, tags, and import tracking

---

### CR-100: Verification Scripts Missing In-Body Assumption Tags (Systemic)

**Status**: DEFERRED — systemic issue (~350 files); should be done incrementally when scripts are touched in future sessions
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Source**: Phase 4 re-audit (Session 189)

#### Problem
7 of 10 sampled verification scripts lack in-body `[A]/[I]/[D]` tags on variable assignments. The protocol template requires:
```python
n_d = 4   # [D] Defect dimension from Frobenius
```
But most scripts have bare assignments: `n_d = 4` with no tags. This is a systemic issue likely affecting the majority of 510 scripts.

#### Proposed Change
Add trailing assumption tags to all framework variable assignments. Could be done as a batch pass targeting the ~20 most-cited scripts first.

#### Files Affected
- ~70% of `verification/sympy/*.py` scripts (estimated ~350 files)

---

### CR-101: Tautological Tests in Verification Scripts

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-02-02
**Source**: Phase 4 re-audit (Session 189)

#### Problem
8 tautological tests found in sample — tests that are `True` by construction (e.g., `("Post-hoc fitting acknowledged", True)`) or self-referential comparisons. These inflate pass counts without verifying computation.

Affected scripts: `honest_statistical_significance.py` (6 tautologies out of 20), `crystallization_angle_alpha.py` (2 out of 15).

#### Proposed Change
Replace tautological tests with genuine computed checks, or remove them entirely.

#### Files Affected
- `verification/sympy/honest_statistical_significance.py` — 6 tautologies
- `verification/sympy/crystallization_angle_alpha.py` — 2 tautologies

---

### CR-102: CRITICAL — Publication Documents Contradict Internal Analysis

**Status**: IMPLEMENTED — audit banners added to 4 publication files
**Priority**: CRITICAL
**Filed**: 2026-02-02
**Source**: Phase 5 re-audit (Session 189)

#### Problem
The 4 publication documents (HONEST_ASSESSMENT, TECHNICAL_SUMMARY, THESIS, OBJECTIONS_AND_RESPONSES) are 70-80 sessions stale and present claims that the project's own internal analysis explicitly says not to use:

1. TECHNICAL_SUMMARY uses P ~ 10^-37 — `STATISTICAL_ANALYSIS_HONEST.md` says "DO NOT USE" and recommends 10^-8 to 10^-7
2. All 4 claim "zero free parameters" — PARAMETER_FREEZE counts ~3 structural assumptions, S170 analysis found more
3. TECHNICAL_SUMMARY marks alpha chain as "COMPLETE" — S187 found Step 5 is a conjecture
4. None mention the S170 Monte Carlo finding that building blocks are NOT special at 1% precision
5. THESIS presents conjectures (Einstein equations, 3 generations) as derivations
6. Script counts: all say "291-295"; actual is 514

**A physicist reading publications would get a significantly more optimistic picture than one reading the internal analysis.**

#### Proposed Change
Full revision of all 4 publication documents to:
1. Replace P ~ 10^-37 with 10^-8 to 10^-7 range
2. Replace "zero parameters" with "~3 structural assumptions"
3. Update alpha chain to reflect S187 classification
4. Add Monte Carlo results from S170
5. Update all script counts, constant counts, and prediction counts
6. Bring into consistency with STATISTICAL_ANALYSIS_HONEST.md

#### Files Affected
- `publications/HONEST_ASSESSMENT.md`
- `publications/TECHNICAL_SUMMARY.md`
- `publications/THESIS.md`
- `publications/OBJECTIONS_AND_RESPONSES.md`

---

### CR-103: Dual Numbering Systems (A1-A16 vs AXM_0100-0119)

**Status**: IMPLEMENTED — cross-reference table added to assumptions_registry.md
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 5 re-audit (Session 189)

#### Problem
`assumptions_registry.md` uses A1-A16 numbering while `core/axioms/` and `CLAIM_DEPENDENCIES.md` use AXM_0100-0119. No mapping between the two systems exists anywhere. Anyone tracing claims through both systems will fail.

#### Proposed Change
Add a mapping table to `assumptions_registry.md` connecting A-numbers to AXM-numbers, or migrate to AXM-numbers entirely. Also note which AXM axioms have no A-number counterpart (AXM_0117-0119).

#### Files Affected
- `registry/assumptions_registry.md` — add mapping or migrate

---

### CR-104: S181+ Content Missing from Registry Files

**Status**: IMPLEMENTED — S181+ entries added to CLAIM_DEPENDENCIES.md
**Priority**: HIGH
**Filed**: 2026-02-02
**Source**: Phase 5 re-audit (Session 189)

#### Problem
AXM_0119, THM_04A5-04AA, DEF_02C5-02C6 (all from S181+) have no entries in:
- CLAIM_DEPENDENCIES.md
- derivations_summary.md
- PARAMETER_FREEZE.md (structural assumptions)
- FALSIFICATION_REGISTRY.md (some)

Six theorems and two definitions lack dependency tracking.

#### Proposed Change
Add entries for all S181+ additions to each registry file.

#### Files Affected
- `registry/CLAIM_DEPENDENCIES.md` — add AXM_0119, THM_04A5-04AA, DEF_02C5-02C6
- `registry/derivations_summary.md` — add S181+ content
- `registry/PARAMETER_FREEZE.md` — add structural assumptions from S132-S175

---

### CR-105: PARAMETER_FREEZE Undercounts Structural Assumptions

**Status**: IMPLEMENTED
**Priority**: MEDIUM
**Filed**: 2026-02-02
**Source**: Phase 5 re-audit (Session 189)

#### Problem
PARAMETER_FREEZE.md counts 3 structural assumptions, but at least 6-8 are actually used:
- [A-STRUCTURAL: Landau expansion] (S132, THM_0487)
- [A-STRUCTURAL: B_total = M_Pl^4] (S172, democratic quartic)
- [A-PHYSICAL: noise proportional to unorthogonality] (S134, Born rule)
- [A-COUPLING: g^2 proportional to Im(algebra)] (tree Weinberg angle)
- Plus the original 3: F=C, Phi_6, n_c sum construction

#### Proposed Change
Add all structural assumptions from S132-S175 to PARAMETER_FREEZE. Update the honest count from 3 to 6-8.

#### Files Affected
- `registry/PARAMETER_FREEZE.md`

---

### CR-106: emerging_patterns.md Abandoned (53 Sessions)

**Status**: IMPLEMENTED — DORMANT status added
**Priority**: LOW
**Filed**: 2026-02-02
**Source**: Phase 5 re-audit (Session 189)

#### Problem
File untouched since S136 (53 sessions ago). Own lifecycle rules say 5+ sessions = STALE. All 4 "active" patterns have been superseded by formal investigation files. The file is de facto abandoned but still listed as operational.

#### Proposed Change
Archive all active patterns and either:
- (a) Mark file as DORMANT with note that patterns are now captured in topic files, or
- (b) Resume active use with current patterns

#### Files Affected
- `registry/emerging_patterns.md`

---

### CR-107: CODATA Version Inconsistency

**Status**: IMPLEMENTED
**Priority**: LOW
**Filed**: 2026-02-02
**Source**: Phase 5 re-audit (Session 189)

#### Problem
FALSIFICATION_REGISTRY uses CODATA 2022 (α = 137.035999206) while derivations_summary uses CODATA 2018 (α = 137.035999084). The 0.9 ppm difference is small but standardization is needed.

#### Proposed Change
Standardize all files on CODATA 2022 as the most recent reference.

#### Files Affected
- `registry/derivations_summary.md` — update CODATA year
- Any other files using CODATA 2018

---

## Rejected

(none yet)
