# Perspective Cosmology: Launch Plan

**Created**: 2026-02-09 (Session S324)
**Last Updated**: 2026-02-09
**Version**: 1.0
**Status**: DRAFT — Awaiting author approval before execution begins
**Owner**: Chris (author) + Claude (AI collaborator)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Strategic Context](#2-strategic-context)
3. [Phase 1: Content Preparation](#3-phase-1-content-preparation)
4. [Phase 2: Website & Interactive UI](#4-phase-2-website--interactive-ui)
5. [Phase 3: Priority Establishment](#5-phase-3-priority-establishment)
6. [Phase 4: Outreach](#6-phase-4-outreach)
7. [Phase 5: Ongoing Operations](#7-phase-5-ongoing-operations)
8. [Risk Matrix](#8-risk-matrix)
9. [Timeline](#9-timeline)
10. [Status Tracker](#10-status-tracker)
11. [Decision Log](#11-decision-log)
12. [Session History](#12-session-history)

---

## 1. Executive Summary

### What

Launch Perspective Cosmology into the public domain via a self-hosted website with interactive exploration tools, paired publications (mathematical foundations + physical interpretation), and targeted academic outreach.

### Why

Three concurrent goals:
1. **Priority protection**: Timestamped public record of the theory under the author's name
2. **Collaboration**: Invite partnership from professional theoretical physicists
3. **Adversarial feedback**: Invite rigorous criticism to identify weaknesses and improve the framework

### How

A phased rollout: content preparation -> website build -> priority establishment -> outreach. The website serves as the permanent "home base" for the project, hosting publications, interactive tools, verification scripts, and ongoing updates.

### Key Constraints

- Author is an amateur (undergrad applied math, no physics PhD)
- Work is heavily AI-assisted (this is positioned as a FEATURE)
- No university affiliation (no built-in distribution channel)
- Framework's own Red Team estimates 25-40% probability of genuine physics (v3.0, S330)
- Traditional publication routes risk dismissal on credentials/format before content review

---

## 2. Strategic Context

### 2.1 The Core Problem

The physics community has a well-calibrated crackpot filter. "Amateur with AI proposes theory of everything" triggers every alarm. The launch strategy must **disarm that filter within the first 60 seconds** while retaining enough boldness to capture attention.

### 2.2 Anti-Crackpot Assets

These are the framework's most valuable credibility signals. They must be **front and center** in all materials:

| Asset | Why It Matters |
|-------|---------------|
| 713+ verification scripts (99.8% pass rate) | Computational rigor unprecedented for amateur work |
| 14 documented failures + 3 retractions | Crackpots never record failures |
| 25-40% self-assessed probability (Red Team v3.0) | Crackpots claim 100% certainty |
| Monte Carlo null model (S170) | We attack our own building blocks |
| 9 blind predictions (6/7 CMB within 1 sigma) | P ~ 2.5e-7, no look-elsewhere correction |
| Hallucination audit (S287-289) | Systematic AI error detection and correction |
| 4 irreducible assumptions (explicitly cataloged) | Transparent about what's assumed vs derived |
| Three-layer hallucination defense | Institutionalized skepticism toward AI output |

### 2.3 The Honest Positioning

**Tone**: Confident but epistemically humble.

> "We think we found something interesting. We might be wrong — we estimate 25-40% chance this is real physics. But the math is checkable, the predictions are falsifiable, and we think it's worth your time to look."

**What we ARE claiming:**
- A candidate mathematical framework that derives 63+ physical constants from division algebra geometry
- 12 sub-10 ppm numerical predictions from integers only
- Qualitative derivation of SM gauge groups, Einstein equations, QM, 3+1 spacetime
- A rigorous AI-assisted methodology with 713+ verification scripts

**What we are NOT claiming:**
- That this is definitely correct
- That we've "solved physics"
- That traditional physics is wrong
- That credentials don't matter (they do — we just don't have them yet)

### 2.4 Target Audiences (in priority order)

| # | Audience | What They Need | Hook |
|---|----------|---------------|------|
| 1 | **Mathematical physicists** (division algebra researchers) | Rigorous math, novel results | CCP axiom, Radon-Hurwitz forcing, Gr(4,11) geometry |
| 2 | **Theoretical physicists** (BSM, unification) | Testable predictions, structural derivations | 5.11 GeV DM, r=0.035, alpha formula |
| 3 | **AI/ML researchers** | Methodology, reproducibility | 713 scripts, hallucination defense, AI-assisted discovery |
| 4 | **Science communicators** | Compelling story, honest uncertainty | "Amateur + AI vs Theory of Everything" narrative |
| 5 | **General public** | Accessible explanation, sense of wonder | "What if the laws of physics are mathematically inevitable?" |

---

## 3. Phase 1: Content Preparation

**Goal**: Complete all written materials to publication quality before website launch.
**Dependencies**: None (can begin immediately)
**Estimated effort**: 4-6 sessions

### 3.1 Upgrade Paired Publications to v1.0

**Status**: NOT STARTED
**Priority**: CRITICAL
**Current state**: Both documents are v0.1 (TEMPLATE/DRAFT), created S255

#### 3.1a: PC_MATHEMATICAL_FOUNDATIONS.md -> v1.0

**File**: `publications/PC_MATHEMATICAL_FOUNDATIONS.md`
**Target**: Complete, self-contained mathematical development from axioms to consequences

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `publications/PC_MATHEMATICAL_FOUNDATIONS.md` | Current v0.1 draft — understand existing structure |
> | `framework/layer_0_pure_axioms.md` | Source axioms (C1-C4, P1-P4, T1) |
> | `core/axioms/AXM_0120_completeness_principle.md` | CCP axiom — the key forcing principle |
> | `framework/investigations/meta/evaluation_map_foundations.md` | Evaluation map theorems (THM_04AC) |
> | `framework/investigations/gauge/perspective_transformative_pipeline.md` | Pipeline: 121->55->18->12 gauge derivation |
> | `framework/investigations/meta/associativity_derivation.md` | Spacetime dimension proof (n_d=4) |
> | `foundations/constants_from_dimensions.md` | Numerical consequences |
> | `framework/IRREDUCIBLE_ASSUMPTIONS.md` | The 4 remaining IRAs — know what's assumed vs derived |
> | `registry/derivations/INDEX.md` | Master index of all derived constants |
> | `framework/investigations/_INDEX.md` | Master index of 150+ investigation files |
>
> **Key sessions for specific sections:**
> - S251 (CCP, pipeline, generations), S258 (CONJ-A3 proof via Radon-Hurwitz)
> - S286 (CONJ-B1 proof via FFT), S292 (CONJ-A1 spectral convergence)
> - S291 (Gr+ topology correction: H_2=Z/2, chi=20), S321 (generation mechanism)
> - S268-S285 (Yang-Mills mass gap, CANONICAL), S278 (Planck constant)
> - S293 (Omega_m derivation), S297 (alpha Step 15), S304 (kappa=1)

The math paper is the intellectual backbone. It must be airtight because it's the one document that can stand on its own merit regardless of who wrote it. A mathematician should be able to read this with no knowledge of the author and evaluate the logic.

#### C1a Chunk Plan (documented S333)

The v0.1 -> v1.0 rewrite is split into 6 chunks to manage session token limits. Each chunk is one session (~15-25K tokens of output). The document is a full rewrite, not a patch of the v0.1.

**Target structure** (20 sections + appendices, ~2500 lines):

| Chunk | Sections | Content | Key Sources | Est. Lines |
|-------|----------|---------|-------------|------------|
| **1** | Frontmatter + Secs 1-4 | Primitives, axioms, CCP, division algebra classification, dimension forcing (n_c=11, n_d=4, F=C) | `layer_0_pure_axioms.md`, `AXM_0120`, `associativity_derivation.md` | ~400 |
| **2** | Secs 5-8 | Grassmannian Gr(4,11) topology (chi=20, b_4=2, quat-Kahler), crystallization dynamics (Mexican hat on Gr, FFT/CONJ-B1), evaluation map (THM_04AC), Lorentz signature (Herm(2), det form) | `evaluation_map_foundations.md`, S291 (topology correction), S286 (CONJ-B1) | ~500 |
| **3** | Secs 9-12 | End(V) decomposition (121=16+28+49+28), pipeline 121->55->18->12, gauge group U(1)xSU(2)xSU(3) (two routes), generation structure from Im(H), hypercharge from F=C (S328) | `perspective_transformative_pipeline.md`, S321 (generations), S328 (U(1)_Y) | ~500 |
| **4** | Secs 13-16 | Democratic counting + Schur, alpha chain (137+4/111, 0 conjectures, tree-to-dressed), Weinberg angle (28/121 tree + one-loop dressing), Omega_m = 63/200 (HS equipartition) | `ALPHA_DERIVATION_MASTER.md`, `constants_from_dimensions.md`, S266, S276, S293 | ~500 |
| **5** | Secs 17-20 | Yang-Mills mass gap + glueball spectrum (CANONICAL), QM from axioms (3 routes, THM_0491), Einstein equations from crystallization, tree-to-dressed paradigm + correction bands | `yang_mills_mass_gap.md`, S302 (QM), `einstein_from_crystallization.md`, S266/S308 (bands) | ~400 |
| **6** | Appendices A-D + final review | A: Radon-Hurwitz/CONJ-A3 proof, B: FFT/CONJ-B1 proof, C: Spectral convergence/CONJ-A1, D: Verification script index. Final consistency pass. | S258, S286, S292 | ~300 |

**Chunk completion tracking**:

| Chunk | Status | Session | Notes |
|-------|--------|---------|-------|
| 1 | COMPLETE | S333 | 390 lines, Secs 1-4. Axioms, CCP, division algebras, forced dims, number theory. |
| 2 | COMPLETE | S334 | ~344 lines, Secs 5-8. Grassmannian topology (S291 corrections), crystallization/CONJ-B1, eval map, Lorentz signature. |
| 3 | COMPLETE | S338 | ~470 lines, Secs 9-12. End(V) decomposition, pipeline 121->55->27->18->12, gauge group emergence, generation structure. |
| 4 | COMPLETE | S340 | ~500 lines, Secs 13-16. Democratic counting + Schur, alpha chain (137+4/111, C=24/11), Weinberg mixing ratio (28/121 + one-loop), partition fraction (63/200). |
| 5 | COMPLETE | S342 | ~400 lines, Secs 17-20. Glueball mass formula (n_d=4 uniqueness, Casimir elimination, SU(N), large-N 10/3). QM from axioms (3 routes, 7 properties, 0 interpretive IRAs). Einstein eqs from Lovelock+crystallization. Tree-to-dressed 3-band paradigm + open problems. |
| 6 | COMPLETE | S343 | Appendices A-D (~210 lines). Radon-Hurwitz/CONJ-A3 proof, FFT/CONJ-B1 proof, spectral convergence/CONJ-A1, verification script index (46 scripts). Cross-ref fixes. Final consistency review PASS. Document v1.0 at 2133 lines. |

**Writing principles**:
1. Pure math only — no physical interpretation (that's the companion's job)
2. Every theorem has: statement, proof or proof sketch, [I-MATH] or [D] tag, verification script ref
3. Notation consistent: n_c=11, n_d=4, Im(D) for imaginary part, Phi_m for cyclotomic
4. Proofs > 1 page go in appendices
5. Each section opens with a one-line companion cross-reference
6. TODOs are forbidden in v1.0 — every section must be complete or explicitly scoped out with a remark

**Key decisions for the rewrite**:
- The v0.1 mixed physical and mathematical content. v1.0 strictly separates them.
- Sections 9.4 (quark mass ratios with underived numerators 150, 124, 219) are CUT from v1.0. Only include identities with complete derivation chains from {1,2,3,4,7,8,11}.
- The "open problems" section (v0.1 Sec 11) becomes Section 20 and is honest about what's derived vs conjectured.
- DM mass formula (5.11 GeV) goes in Part V as an extended result, not Part IV (it's a [CONJECTURE]).

**Requirements**:
- [ ] All sections complete (currently only Part I scaffolded)
- [ ] Full proof chain from axioms -> division algebras -> crystallization -> gauge groups -> predictions
- [ ] Every theorem referenced has a verification script
- [ ] No physical interpretation (that's the companion's job)
- [ ] Internal consistency check: no theorem depends on unstated assumptions
- [ ] Notation consistent throughout
- [ ] Appendices for lengthy proofs
- [ ] References to relevant mathematical literature (Hurwitz, Frobenius, Radon, etc.)

**Sections needed** (draft outline):
```
PART I:   Algebraic Foundations (Sections 1-4)
          - Primitives, axioms, CCP
          - Division algebra classification (I-MATH)
          - Dimension forcing: n_c=11, n_d=4
          - Field forcing: F=C

PART II:  Geometric Consequences (Sections 5-8)
          - Grassmannian Gr(4,11) and its topology
          - Crystallization dynamics on Gr(4,11)
          - Evaluation map and perspective structure
          - Lorentz signature derivation

PART III: Algebraic Structure (Sections 9-12)
          - End(V) decomposition: 121 = 16+28+49+28
          - Pipeline: 121 -> 55 -> 18 -> 12
          - Gauge group emergence: U(1) x SU(2) x SU(3)
          - Generation structure from Im(H)

PART IV:  Numerical Consequences (Sections 13-16)
          - Democratic counting and Schur's lemma
          - Alpha: 137 + 4/111 derivation chain
          - Weinberg angle: sin^2(theta_W) = 28/121
          - Cosmological parameters: Omega_m = 63/200

PART V:   Extended Results (Sections 17-20)
          - Yang-Mills mass gap and glueball spectrum
          - QM from axioms (Hilbert space, Born rule)
          - Einstein equations from crystallization
          - Tree-to-dressed paradigm and correction bands

APPENDICES:
          A. Radon-Hurwitz theorem and CONJ-A3 proof
          B. FFT on Hom(R^4,R^7) and CONJ-B1 proof
          C. Spectral convergence (CONJ-A1)
          D. Complete verification script index
```

#### 3.1b: PC_INTERPRETIVE_COMPANION.md -> v1.0

**File**: `publications/PC_INTERPRETIVE_COMPANION.md`
**Target**: Section-by-section physical interpretation, parallel to the math paper

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `publications/PC_INTERPRETIVE_COMPANION.md` | Current v0.1 draft |
> | `publications/PC_MATHEMATICAL_FOUNDATIONS.md` | Must mirror this section-by-section |
> | `framework/layer_2_correspondence.md` | Explicit physics imports (Layer 2) |
> | `framework/layer_3_predictions.md` | Predictions derived from framework |
> | `claims/README.md` | Tiering system and honest statistics |
> | `claims/TIER_1_SIGNIFICANT.md` | The 12 sub-10 ppm claims with caveats |
> | `claims/FALSIFIED.md` | 14 failures — must be referenced honestly |
> | `publications/HONEST_ASSESSMENT.md` | Overall self-evaluation — tone guide |
> | `registry/RED_TEAM_SUMMARY_V3.md` | Adversarial review v3.0 findings (25-40%) |
> | `predictions/BLIND_PREDICTIONS.md` | 9 blind predictions — strongest evidence |
> | `framework/IRREDUCIBLE_ASSUMPTIONS.md` | What's assumed at each step |
> | `registry/FALSIFICATION_REGISTRY.md` | What would disprove each claim |

**Requirements**:
- [ ] Every section in the math paper has a corresponding companion section
- [ ] Physical interpretation clearly separated from mathematical fact
- [ ] All [A-PHYSICAL] and [A-IMPORT] assumptions explicitly flagged
- [ ] Derivation chains with [A]/[I]/[D] tags throughout
- [ ] Connection to experimental measurements for every prediction
- [ ] Honest assessment of gaps and uncertainties per section
- [ ] CCP motivation and philosophical context
- [ ] "What would falsify this section" for each major claim

### 3.2 New Document: AI Methodology

**Status**: NOT STARTED
**Priority**: HIGH
**File**: `launch/content/AI_METHODOLOGY.md` (draft) -> `publications/AI_METHODOLOGY.md` (final)

This document turns AI assistance from a liability into a feature. It describes a reusable methodology for AI-assisted theoretical exploration.

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `.claude/rules/01-confidence-tagging.md` | Confidence tag protocol |
> | `.claude/rules/02-verification-protocol.md` | Verification workflow and script standards |
> | `.claude/rules/03-session-workflow.md` | Full session protocol (startup, during, end) |
> | `.claude/rules/04-skepticism-checklist.md` | HRS scoring and hallucination defense |
> | `CLAUDE.md` (project root) | Master project instructions — the AI's "constitution" |
> | `registry/HALLUCINATION_LOG.md` | Caught LLM errors — concrete examples |
> | `verification/sympy/framework_constants.py` | Centralized constant values |
> | `.quality/report.md` | Most recent quality engine output |
> | `HALLUCINATION_PROTECTION.md` | Root-level hallucination defense overview |
>
> **Key sessions for methodology examples:**
> - S287 (hallucination audit: 5-stream, 651 scripts, 8 phantoms)
> - S288-S289 (remediation: CODATA 2022, Unicode, runtime fixes)
> - S261 (LLM Challenge v3: GPT-4o failure analysis)
> - S257 (LLM Challenge v2: 15/18 PASS; Red Team v2.0)
> - S128-S135 (LLM Challenge v1: 3/4 SUCCESS)
> - S264 (Quality Engine Run #5: 13/13 action items)

**Outline**:
```
1. Introduction: Why AI-Assisted Theoretical Physics
   - The exploration partner model (not oracle)
   - What AI is good at (pattern recognition, computation, bookkeeping)
   - What AI is bad at (mathematical rigor, physical intuition, novelty)

2. The Three-Layer Hallucination Defense
   - Layer 1: SymPy verification for ALL calculations
   - Layer 2: Multi-path verification for sub-percent claims
   - Layer 3: Semantic consistency for complex derivations
   - HRS (Hallucination Risk Score) protocol
   - Warning signs and automatic triggers

3. The Verification Infrastructure
   - 713+ scripts in verification/sympy/
   - Script standards (assumptions, calculation, comparison, tests)
   - Pass rate tracking and regression detection
   - framework_constants.py (centralized values)

4. The Hallucination Audit (S287-289)
   - 651 scripts audited across 5 streams
   - 8 phantom results found (3% rate)
   - CODATA 2022 standardization (61 scripts updated)
   - Unicode remediation (248 scripts)
   - Result: 88.9% -> 99.8% pass rate

5. Session Protocol
   - Mandatory startup reads
   - Confidence tagging defaults ([CONJECTURE])
   - Formalization queue (nothing left unrecorded)
   - Topic transition checkpoints

6. Quality Engine
   - Automated scanning for consistency issues
   - Investigation priority scoring
   - Propagation manifest for cross-reference integrity

7. Limitations and Honest Assessment
   - The derivation vs. discovery problem
   - LLM Challenge results (v1: 3/4 success, v3: informative failure)
   - What this methodology cannot prove
   - Recommendations for others using this approach
```

### 3.3 New Document: Landscape Comparison

**Status**: NOT STARTED
**Priority**: HIGH
**File**: `launch/content/LANDSCAPE_COMPARISON.md` (draft) -> `publications/LANDSCAPE_COMPARISON.md` (final)

Respectful comparison with existing unification programs. Tone: "These are brilliant efforts by brilliant people. Here's where we think Perspective offers a complementary angle."

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `publications/OBJECTIONS_AND_RESPONSES.md` | Existing mentions of other theories (Obj 1, 5, 10) |
> | `publications/PC_INTERPRETIVE_COMPANION.md` | Preface mentions other approaches |
> | `core/axioms/AXM_0120_completeness_principle.md` | CCP — the key differentiator from other programs |
> | `framework/investigations/gauge/perspective_transformative_pipeline.md` | PC's gauge derivation (for comparison) |
> | `publications/THESIS.md` | PC's central claim in condensed form |
> | `framework/IRREDUCIBLE_ASSUMPTIONS.md` | PC's assumption count (for comparison) |
>
> **External research needed** (use WebSearch during session):
> - Cohl Furey's latest papers (division algebras + particles, ~2018-2024)
> - Latham Boyle & Shane Farnsworth (NCG + division algebras, ~2020-2024)
> - Geoffrey Dixon "Division Algebras: Octonions, Quaternions, Complex Numbers and the Algebraic Design of Physics"
> - Connes NCG Standard Model (spectral action, ~2006-2024)
> - Garrett Lisi E8 theory status (2007 paper + subsequent critiques)
> - LQG current state (Rovelli, Thiemann reviews)
> - String theory landscape problem (Susskind, Bousso reviews)
>
> **Key PC differentiators to emphasize:**
> - CCP axiom (selection principle vs. choice)
> - Crystallization dynamics (dynamics, not just kinematics)
> - 63+ numerical predictions (vs. structure-only in most alternatives)
> - 14 documented failures + 3 retractions (vs. unfalsifiable alternatives)

**Outline**:
```
1. The Unification Landscape
   - The shared goal: derive the Standard Model + gravity from first principles
   - Why it's hard: the input problem (what do you start with?)
   - Common theme: every program must CHOOSE something

2. String Theory
   - Achievements: rich mathematical structure, dualities, holography, AdS/CFT
   - The vacuum problem: 10^500 solutions, no selection principle
   - PC comparison: CCP provides a selection principle (maximal consistency)
   - What we learn: mathematical structure CAN encode physics
   - Respectful note: string theory's mathematical contributions are permanent

3. Loop Quantum Gravity
   - Achievements: background independence, discrete spacetime, black hole entropy
   - The matter problem: quantum gravity but no particle physics
   - PC comparison: same algebraic source gives both gravity AND particles
   - What we learn: background independence is important

4. E8 Theory (Garrett Lisi)
   - Achievements: elegant unification attempt, all particles in one algebra
   - The forcing problem: E8 is chosen, not derived
   - PC comparison: CCP derives which algebraic structure must appear
   - What we learn: Lie algebras can organize particle content

5. Noncommutative Geometry (Connes)
   - Achievements: SM from spectral triple, beautiful geometric framework
   - The finite-space problem: the "internal" spectral triple is chosen by hand
   - PC comparison: CCP + division algebras force the internal structure
   - What we learn: geometry generalizes beautifully

6. Division Algebra Approaches (Furey, Dixon, Boyle-Farnsworth)
   - These are PC's closest relatives
   - Achievements: R,C,H,O -> particle content (Furey), SM structure (Dixon)
   - What PC adds: CCP axiom (why THESE algebras?), crystallization (dynamics),
     numerical predictions (not just structure)
   - Specific comparison points: generation structure, gauge group derivation
   - Honest admission: much of PC's algebraic content parallels this work

7. What Makes PC Different (Summary)
   - The CCP axiom: instead of choosing, ask what maximal consistency forces
   - Crystallization: dynamics on Gr(4,11), not just kinematics
   - Numerical predictions: 63+ constants, not just structure
   - Falsifiability: concrete predictions (5.11 GeV DM, r=0.035)
   - Self-criticism: 14 failures documented, 25-40% self-assessment

8. What PC Does NOT Do (Yet)
   - No quantum gravity computation (no loop corrections to GR)
   - CC magnitude gap (~10^111)
   - CKM mechanism [DERIVATION] (S325) but mixing angles incomplete
   - y_b/y_t hierarchy unsolved
   - 4 irreducible assumptions remain
```

### 3.4 New Document: For Skeptics

**Status**: COMPLETE (v2.0, S332)
**Priority**: HIGH
**File**: `launch/content/FOR_SKEPTICS.md` (draft) -> website content

This is potentially the highest-impact piece. Many physicists will give 60 seconds. This document makes those 60 seconds count.

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `framework/STATISTICAL_ANALYSIS_HONEST.md` | Monte Carlo null model, P-value range — the statistical backbone |
> | `predictions/BLIND_PREDICTIONS.md` | 9 blind predictions — strongest evidence section |
> | `claims/FALSIFIED.md` | 14 failures — key honesty signal |
> | `publications/HONEST_ASSESSMENT.md` | Overall self-evaluation — draw tone and content from here |
> | `registry/RED_TEAM_SUMMARY_V3.md` | Adversarial review v3.0 (25-40%, 12 surviving criticisms) |
> | `publications/OBJECTIONS_AND_RESPONSES.md` | Existing objection handling — don't duplicate, reference |
> | `claims/TIER_1_SIGNIFICANT.md` | The 12 sub-10 ppm claims (the "check these" candidates) |
> | `sessions/S261.md` | LLM Challenge v3 — "other AI can't find these from axioms" |
> | `sessions/S257.md` | Red Team v2.0 details and LLM Challenge v2 |

**Outline** (implemented v2.0, S332):
```
1. Yes, We Might Be Wrong (25-40%)
   - Our own adversarial review (3-agent Red Team v3.0, S330)
   - This is not false modesty; it's a calibrated probability

2. Our Building Blocks Aren't Special
   - Monte Carlo (S170): ANY 7-element subset of {1,...,20} matches 11 constants at 1%
   - The framework is AVERAGE at percent-level matching (51st percentile)
   - The evidence does NOT come from building-block specialness

3. But Our Blind Predictions Are
   - 9 predictions made BEFORE checking measurements
   - 6/7 CMB within 1 sigma
   - Combined P ~ 2.5 x 10^-7 (no look-elsewhere correction)
   - These carry zero post-hoc penalty

4. And We Derive Structure, Not Just Numbers
   - U(1) x SU(2) x SU(3) from pipeline 121 -> 55 -> 18 -> 12
   - 3+1 spacetime from quaternion structure
   - QM (Hilbert space, Born rule) from axioms alone (Grade A)
   - Einstein equations from crystallization dynamics
   - Random number matching CANNOT produce these

5. Here Are 14 Things We Got Wrong
   - Link to FALSIFIED.md
   - We record failures because that's how science works

6. The Most Efficient Path to Evaluate This
   - Check these 3 formulas independently (alpha, Weinberg, Omega_m)
   - Run any of the 713+ verification scripts
   - Read the mathematical foundations paper (no physics required)
   - If you find an error, we want to know: [contact]

7. The Hardest Objection We Face
   - "Were these formulas DERIVED or DISCOVERED (by searching)?"
   - We can't prove they were derived (this is honest)
   - But: LLM Challenge v3 shows other AI can't find them from axioms alone
   - And: the qualitative structure can't be found by searching
```

### 3.5 Update Existing Publications

**Status**: NOT STARTED
**Priority**: MEDIUM

Several existing documents need updates to reflect S257-S323 advances:

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `publications/CLAUDE.md` | Publications directory conventions and reading order |
> | `sessions/INDEX.md` | What's changed since each pub's last update |
> | `framework/IRREDUCIBLE_ASSUMPTIONS.md` | Current IRA count (4) — many pubs cite old counts |
> | `publications/HONEST_ASSESSMENT.md` | v2.3 (S301) — check if S302-S323 changes propagated |
> | `registry/PROPAGATION_MANIFEST.md` | Outstanding stale cross-references |
>
> **Key changes since last pub updates (S301/S330):**
> - IRA count: 6 -> 4 (IRA-01 resolved S304, IRA-10 resolved S302)
> - IRA-09: mechanism corrected S320/S321 (SU(3)=color, Hom(H,R^7) generations)
> - Script count: ~662 -> ~713
> - Dark matter: 5.11 GeV mass formula survives; DM identity OPEN (S335: pNGB singlet = Higgs)
> - H-parity: pNGB potential stable in boson sector [THEOREM] (S323; scope clarified S335)
> - Dark quarks: colored scalars at ~TeV [CONJECTURE] (S323)
> - Red Team v3.0 (S330): Probability 25-40%, 12 surviving criticisms
> - CKM mechanism from Im(H) (S325), colored pNGB P-022 at 1.76 TeV (S326)

- [ ] `THESIS.md` — verify current (v2.3, S301). May need S302-S323 update.
- [ ] `TECHNICAL_SUMMARY.md` — verify current. Check IRA count, script counts.
- [ ] `OBJECTIONS_AND_RESPONSES.md` — add objections about AI methodology.
- [ ] `PLAIN_LANGUAGE_DESCRIPTION.md` — verify current. Add dark matter section.
- [ ] `PHYSICIST_SUMMARY.md` — verify current.
- [ ] `QUICKSTART.md` — rewrite for website audience (not repo browser).

### 3.6 New Document: FAQ

**Status**: NOT STARTED
**Priority**: MEDIUM
**File**: `launch/content/FAQ.md` (draft) -> website content

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `publications/OBJECTIONS_AND_RESPONSES.md` | Existing Q&A — don't duplicate, adapt for FAQ format |
> | `publications/PLAIN_LANGUAGE_DESCRIPTION.md` | Accessible language for general audience answers |
> | `publications/HONEST_ASSESSMENT.md` | Source for probability, statistics, honest framing |
> | `claims/README.md` | Tiering system explanation (for "is this numerology?" answer) |
> | `framework/IRREDUCIBLE_ASSUMPTIONS.md` | "How many free parameters?" answer |
> | `predictions/BLIND_PREDICTIONS.md` | "What predictions?" answer |
> | `claims/FALSIFIED.md` | "What has this gotten wrong?" answer |

**Key questions to answer**:
```
General:
- What is Perspective Cosmology?
- Who is behind this?
- Why should I take amateur work seriously?
- What's the probability this is real?

Methodology:
- How was AI used in this work?
- Can AI hallucinate math proofs?
- How do you verify AI-generated results?
- Why not just publish a normal paper?

Physics:
- Is this just numerology?
- How many free parameters does this have?
- What predictions does this make?
- What has this gotten WRONG?
- How does this relate to string theory / LQG / etc?

Technical:
- What are division algebras?
- What is the CCP axiom?
- How does 137 come from 4^2 + 11^2?
- What's the derivation chain for alpha?

Getting Involved:
- How can I check the math myself?
- How can I contribute?
- Who should I contact?
```

---

## 4. Phase 2: Website & Interactive UI

**Goal**: Build a professional, compelling website that serves as the permanent home base.
**Dependencies**: Phase 1 content (can develop in parallel, content slots in later)
**Estimated effort**: 4-8 sessions (depends on UI complexity)

### 4.1 Domain & Hosting

**Status**: NOT STARTED
**Priority**: HIGH

**Decisions needed**:
- [ ] Domain name: `perspectivecosmology.com`? `.org`? Other?
- [ ] Hosting: Vercel / Netlify / GitHub Pages / self-hosted?
- [ ] Tech stack: Next.js / Astro / Hugo / plain HTML+JS?
- [ ] Design: Custom CSS / Tailwind / existing template?

**Recommendation**: Astro or Next.js on Vercel. Static generation for speed, with interactive islands for the explorer UI. Free tier sufficient for initial traffic.

### 4.2 Site Architecture

> **Content sources for each route:**
>
> | Route | Source File(s) |
> |-------|---------------|
> | `/` | Landing page — composed from `HONEST_ASSESSMENT.md` + `TIER_1_SIGNIFICANT.md` |
> | `/explore` | Data from `claims/TIER_1_SIGNIFICANT.md`, `TIER_2_POSSIBLE.md`, `TIER_3_MATCHED.md`, `FALSIFIED.md` |
> | `/explore/derivations` | Chain data from `registry/CLAIM_DEPENDENCIES.md` + `framework/IRREDUCIBLE_ASSUMPTIONS.md` |
> | `/publications/math` | `publications/PC_MATHEMATICAL_FOUNDATIONS.md` (rendered) |
> | `/publications/physics` | `publications/PC_INTERPRETIVE_COMPANION.md` (rendered) |
> | `/publications/methodology` | `publications/AI_METHODOLOGY.md` (from C2 deliverable) |
> | `/comparisons` | `publications/LANDSCAPE_COMPARISON.md` (from C3 deliverable) |
> | `/skeptics` | `launch/content/FOR_SKEPTICS.md` (from C4 deliverable) |
> | `/verify` | Links to `verification/sympy/` scripts on GitHub |
> | `/predictions` | `predictions/BLIND_PREDICTIONS.md` + `claims/FALSIFIED.md` |
> | `/about` | `publications/HONEST_ASSESSMENT.md` + new author bio content |
> | `/faq` | `launch/content/FAQ.md` (from C6 deliverable) |

```
/                        Landing page (the 60-second hook)
/explore                 Interactive prediction explorer
/explore/derivations     Derivation chain viewer
/explore/algebra         Division algebra visualizer
/publications            The paired papers + all publication docs
/publications/math       Mathematical Foundations (rendered)
/publications/physics    Interpretive Companion (rendered)
/publications/methodology AI Methodology document
/comparisons             Landscape comparison
/skeptics                "For Skeptics" page
/verify                  Verification portal (scripts, how to run them)
/predictions             Blind predictions registry + falsified claims
/about                   Who we are, the story, honest assessment
/blog                    Ongoing updates, new results
/faq                     Frequently asked questions
/contact                 How to reach us, collaboration inquiries
```

### 4.3 Landing Page Design

**Status**: NOT STARTED
**Priority**: CRITICAL

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `publications/HONEST_ASSESSMENT.md` | Source for all claims, statistics, framing |
> | `claims/TIER_1_SIGNIFICANT.md` | The 12 headline predictions with exact values |
> | `publications/THESIS.md` | The central claim in condensed form — tone guide |
> | `publications/PLAIN_LANGUAGE_DESCRIPTION.md` | Accessible language for general audience |
> | This plan, Section 2.2-2.3 | Anti-crackpot assets and honest positioning |
> | This plan, Appendix B | Key numbers quick reference for consistency |

The landing page must accomplish three things in 10 seconds:
1. Hook attention (bold claim)
2. Disarm the crackpot filter (immediate honesty)
3. Provide clear navigation paths

**Design specification**:

```
HERO SECTION:
  Headline: "What if the laws of physics are mathematically inevitable?"

  Subhead: "A framework deriving 63+ physical constants from division
  algebra geometry. 12 match measurements to better than 10 parts per
  million. 14 predictions failed. We estimate a 25-40% chance this is
  real physics."

  CTA buttons: [Explore Predictions]  [Read the Math]  [Why Be Skeptical]

THREE-COLUMN SECTION:
  Column 1: "What We Claim"
    - SM gauge group derived from first principles
    - Fine structure constant to 0.27 ppm
    - Weinberg angle to 3.75 ppm
    - Dark matter mass prediction: 5.11 GeV
    - QM derived from observation axioms
    - Einstein equations from crystallization

  Column 2: "Why You Should Doubt It"
    - Author is amateur with AI assistance
    - Building blocks aren't special (Monte Carlo)
    - Most predictions are post-hoc
    - Could be sophisticated numerology
    - 4 irreducible assumptions remain
    - CC magnitude gap unsolved

  Column 3: "Why It Might Be Real"
    - 9 blind predictions succeeded (P ~ 2.5e-7)
    - Derives structure, not just numbers
    - 713+ verification scripts (99.8% pass)
    - 14 failures + 3 retractions documented honestly
    - Only 4 assumptions for ALL of physics
    - Concrete falsification criteria

HIGHLIGHT SECTION:
  "The 3 results most worth checking:"
  1. 1/alpha = 137 + 4/111 (0.27 ppm)
  2. sin^2(theta_W) = 28/121 (0.10%)
  3. Omega_m = 63/200 (EXACT match to Planck)

FOOTER TAGLINE:
  "25-40% chance this is genuine physics.
   100% chance the math is worth checking."
```

### 4.4 Interactive Prediction Explorer

**Status**: NOT STARTED
**Priority**: HIGH (this is the "teaser" UI the author envisions)

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `claims/TIER_1_SIGNIFICANT.md` | 12 sub-10 ppm predictions (data source) |
> | `claims/TIER_2_POSSIBLE.md` | 16 mid-tier predictions (data source) |
> | `claims/TIER_3_MATCHED.md` | ~41 broader predictions (data source) |
> | `claims/FALSIFIED.md` | 14 failures (must be included in explorer) |
> | `registry/CLAIM_DEPENDENCIES.md` | Derivation chain data (what depends on what) |
> | `registry/derivations/INDEX.md` | All derived constants organized by domain |
> | `framework/IRREDUCIBLE_ASSUMPTIONS.md` | Axiom/assumption nodes for chain viewer |
> | `verification/VERIFICATION_STATUS.md` | Script pass/fail status per prediction |
> | `verification/sympy/framework_constants.py` | Centralized measured values |
> | `predictions/BLIND_PREDICTIONS.md` | Blind vs post-hoc distinction (display flag) |
>
> **Data extraction note:** The prediction browser needs structured data (JSON/CSV) extracted
> from the claims markdown files. A data extraction script should be written early to parse
> these files into a format the UI can consume. Consider `launch/data/predictions.json`.

**Features**:

#### 4.4a: Prediction Browser
- Sortable/filterable table of all 63+ predictions
- Columns: Name, Formula, Framework Value, Measured Value, Precision, Tier, Status
- Click any prediction to expand: derivation chain, assumptions used, verification script, measurement source
- Color coding: Green (sub-10 ppm), Yellow (10-10000 ppm), Orange (>10000 ppm), Red (falsified)
- Filter by: domain (particles, cosmology, CMB, BBN), tier, status, confidence level

#### 4.4b: Derivation Chain Viewer
- Interactive graph/tree visualization
- Pick any prediction, see the full chain back to axioms
- Nodes: axioms (blue), theorems (green), conjectures (yellow), imports (orange)
- Edges: labeled with [A], [I], [D] tags
- Click any node to see details, verification status, script links
- Highlight path from axiom to any specific prediction

#### 4.4c: Division Algebra Visualizer
- Interactive exploration of R, C, H, O
- Show dimensions: 1, 2, 4, 8 and their combinations
- Show imaginary dimensions: 0, 1, 3, 7 and n_c = 1+3+7 = 11
- Show key composites: 137 = 4^2 + 11^2, 121 = 11^2, 28 = 4*7
- How each number appears across multiple predictions (coherence visualization)

#### 4.4d: Theory Comparison Tool
- Side-by-side comparison of PC vs other theories
- Criteria: predictions made, free parameters, mathematical rigor, testability
- Interactive: check boxes for which theories to compare

### 4.5 Verification Portal

**Status**: COMPLETE (S354)
**Priority**: MEDIUM

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `verification/VERIFICATION_STATUS.md` | Current pass/fail summary |
> | `verification/sympy/framework_constants.py` | Centralized constants (CODATA 2022) |
> | `verification/sympy/` directory (ls) | Full script inventory (~713 scripts) |
> | `.claude/rules/02-verification-protocol.md` | Script standards to explain to users |
>
> **Curated "start here" scripts** (choose ~5-10 that are self-contained and impressive):
> - `alpha_enhanced_prediction.py` — the headline alpha result
> - `weinberg_best_formula.py` — Weinberg angle
> - `omega_lambda_derivation.py` — cosmological constant
> - `dark_matter_mass_prediction.py` — DM at 5.11 GeV
> - `conj_a3_radon_hurwitz_proof.py` — CONJ-A3 theorem (pure math)
> - `generation_mechanism_formalization.py` — 3 generations
> - `qm_from_axioms_*.py` — QM derivation (if exists as single script)

**Content**:
- Direct links to GitHub repository (all scripts)
- Instructions for running scripts locally (Python + SymPy)
- Curated "start here" set of 5-10 most important scripts
- Possibly: browser-based SymPy runner for simple scripts (stretch goal)
- Links to CODATA 2022 source values used in comparisons
- How to report errors found

### 4.6 Blog Infrastructure

**Status**: NOT STARTED
**Priority**: MEDIUM (needed for ongoing content, not for launch)

- Blog posts in markdown, rendered by the site generator
- RSS feed for subscribers
- Categories: Results, Methodology, Comparison, Meta
- First 5 posts planned (see Phase 4 outreach strategy)

---

## 5. Phase 3: Priority Establishment

**Goal**: Create timestamped, immutable public records establishing authorship and date.
**Dependencies**: Phase 1 content complete (or nearly)
**Estimated effort**: 1-2 sessions

### 5.1 Public GitHub Repository

**Status**: NOT STARTED
**Priority**: CRITICAL

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `README.md` (project root) | Current README — needs rewrite for public audience |
> | `PLACEMENT_GUIDE.md` | Directory structure explanation (adapt for public README) |
> | `CLAUDE.md` (project root) | AI instructions — decide: include publicly or not? |
> | `.gitignore` | Review for sensitive content |
> | `registry/ACTIVE_SESSIONS.md` | Contains session workflow details — decide: expose? |
>
> **Sensitive content check** (must NOT be in public repo):
> - Author's full name/email in any file (search before publishing)
> - Any API keys, credentials, or private URLs
> - Draft content not ready for public eyes (check `launch/content/`)
> - Personal notes in session files (review recent sessions for anything private)

- [ ] Decision: make current repo public OR create clean public mirror?
- [ ] If mirror: decide what to include/exclude (sessions? registry? all investigations?)
- [ ] README.md: clear project description, quick start, how to run scripts
- [ ] LICENSE: CC BY-SA 4.0 for content, MIT for code (decision needed)
- [ ] CONTRIBUTING.md: how others can participate
- [ ] .gitignore review: ensure no sensitive content
- [ ] Verify full commit history provides adequate timestamp chain

**Considerations for public vs mirror**:
- **Public (current repo)**: Full history, maximum transparency, but includes messy session tracking, internal notes, draft content
- **Clean mirror**: Curated presentation, but loses history. Could cherry-pick commits or squash.
- **Hybrid**: Make current repo public but add a clear README explaining the structure. Session files ARE part of the story (showing the process).

### 5.2 Zenodo DOI Registration

**Status**: NOT STARTED
**Priority**: HIGH

> **Documents to upload** (must be at v1.0 before upload):
>
> | Document | Source File | DOI Type |
> |----------|-----------|----------|
> | Mathematical Foundations | `publications/PC_MATHEMATICAL_FOUNDATIONS.md` (convert to PDF) | Primary publication |
> | Interpretive Companion | `publications/PC_INTERPRETIVE_COMPANION.md` (convert to PDF) | Primary publication |
> | AI Methodology | `publications/AI_METHODOLOGY.md` (convert to PDF) | Supporting document |
> | Verification Script Archive | `verification/sympy/` (ZIP archive) | Software/dataset |
>
> **Zenodo metadata**: Use "Preprint" type. Keywords: division algebras, fine structure constant,
> unification, AI-assisted physics. License: CC BY-SA 4.0 for text, MIT for code.

- [ ] Create Zenodo account
- [ ] Upload paired publications (v1.0) as a single record
- [ ] Mint DOI for each major document
- [ ] Add DOI badges to website
- [ ] Provides formal, citable, timestamped academic records
- [ ] No endorser required (unlike arXiv)

### 5.3 Archive.org Snapshots

**Status**: NOT STARTED
**Priority**: MEDIUM

- [ ] Submit website URL to Wayback Machine after launch
- [ ] Submit GitHub repo URL
- [ ] Provides independent third-party timestamp
- [ ] Automate periodic snapshots (Wayback Machine supports this)

### 5.4 arXiv Submission (Stretch Goal)

**Status**: NOT STARTED
**Priority**: LOW (don't block on this)

- [ ] The math paper could potentially go on `math-ph` or `math.DG`
- [ ] Requires an endorser in the relevant category
- [ ] Could come from Phase 4 outreach (if a researcher is willing to endorse)
- [ ] If achieved, provides maximum academic credibility
- [ ] If not: Zenodo DOIs are fully sufficient for priority protection

---

## 6. Phase 4: Outreach

**Goal**: Drive targeted attention to the website from people who can evaluate the work.
**Dependencies**: Website live (Phase 2), priority established (Phase 3)
**Estimated effort**: Ongoing

### 6.1 Targeted Academic Outreach

**Status**: NOT STARTED
**Priority**: HIGH (but only after launch)

> **Context files to read before starting this task:**
>
> | File | Why |
> |------|-----|
> | `publications/HONEST_ASSESSMENT.md` | Framework summary for email content |
> | `publications/THESIS.md` | Central claim for concise description |
> | `framework/investigations/_INDEX.md` | Find specific results relevant to each researcher |
> | `framework/investigations/gauge/perspective_transformative_pipeline.md` | Gauge derivation (for Furey, Boyle) |
> | `framework/investigations/particles/generation_structure.md` | Generation mechanism (for Furey, Nichol) |
> | `core/axioms/AXM_0120_completeness_principle.md` | CCP axiom (for all — the differentiator) |
> | `sessions/S251.md` | CCP session — most relevant for division algebra researchers |
>
> **Pre-outreach research needed** (use WebSearch):
> - Verify each researcher's current affiliation and recent publications
> - Find the single most relevant paper from each to reference specifically
> - Check if any have publicly commented on division algebra approaches recently

**Target researchers** (prioritized by relevance):

| # | Researcher | Affiliation | Why Relevant | Approach Angle |
|---|-----------|------------|-------------|---------------|
| 1 | Cohl Furey | Cambridge | Division algebras + particles | "We share a starting point. Our CCP axiom may interest you." |
| 2 | Latham Boyle | Perimeter Institute | Mirror universe, NCG | "Your spectral approach and our algebraic one may connect." |
| 3 | John Baez | UC Riverside | Division algebras, n-categories, blogger | Math rigor + wide audience. He reviews speculative ideas publicly. |
| 4 | Geoffrey Dixon | Independent | Author of "Division Algebras" book | Pioneer of the approach. Would want to know about CCP. |
| 5 | Michael Duff | Imperial College | Octonions + physics | Active advocate for octonion-physics connection. |
| 6 | Nichol Furey | HU Berlin | Division algebras + generations | Generation structure from Im(H) directly relevant. |

**Email template** (adapt per recipient):
```
Subject: Division algebra framework with 713 verification scripts — seeking expert feedback

Dr. [Name],

I'm an amateur researcher (applied math background) who has used AI-assisted
methods to develop a framework connecting division algebra geometry to physical
constants. I'm writing because your work on [specific paper/topic] is closely
related, and I'd value your expert evaluation.

The framework:
- Derives SM gauge group from a "Completeness Principle" on {R,C,H,O}
- Predicts 1/alpha = 137 + 4/111 (0.27 ppm from CODATA)
- Has 713+ SymPy verification scripts (99.8% pass rate)
- Documents 14 failed predictions
- Self-assessed probability: 25-40% (adversarial Red Team v3.0 review)

The specific result I think you'd find most relevant to your work:
[one paragraph tailored to their research]

Everything is publicly available at [website URL], including all verification
scripts and the full mathematical development. I welcome criticism — the
framework improves when its weaknesses are identified.

Best regards,
Chris [last name]
[website URL]
```

### 6.2 Online Presence

**Status**: NOT STARTED
**Priority**: HIGH

#### 6.2a: X/Twitter Launch Thread

> **Context files for drafting:**
> - `publications/PLAIN_LANGUAGE_DESCRIPTION.md` — accessible language source
> - `claims/TIER_1_SIGNIFICANT.md` — headline numbers to cite
> - `publications/HONEST_ASSESSMENT.md` — self-critique material for honesty tweets
> - This plan, Section 2.2 — anti-crackpot assets to weave in
> - This plan, Appendix B — key numbers for consistency

**Format**: Thread of 10-15 tweets

```
Tweet 1 (Hook):
"I'm an amateur who used AI to explore whether the laws of physics
are mathematically inevitable. After 330+ sessions and 713 verification
scripts, here's what I found — and why I'm only 25-40% sure it's real.
Thread."

Tweet 2 (The idea):
"Start with one question: what is the minimum math required for
observation to exist? Just 4 axioms about 'partial access to a
complete structure.' The Frobenius-Hurwitz theorem then forces you
into division algebras: dimensions 1, 2, 4, 8."

Tweet 3 (The punchline):
"Those dimensions — combined with a completeness principle — give you:
- 4^2 + 11^2 = 137 (fine structure constant)
- 28/121 = sin^2(theta_W) (Weinberg angle)
- 63/200 = Omega_m (matter density)
All from integers. Zero free parameters."

[Continue through key results, methodology, failures, invitation]

Final tweet:
"I might be completely wrong. But 713 scripts say the math checks out,
and the blind predictions succeeded. The full framework, all verification
code, and an interactive explorer are at [URL]. Tear it apart."
```

#### 6.2b: Hacker News Post

**Title**: "AI-Assisted Theoretical Physics: How 713 Verification Scripts Keep an Amateur Framework Honest"

**Angle**: The AI methodology story, not the physics claims. HN audience will be drawn to the process, then discover the content. Link to the methodology page, not the landing page.

#### 6.2c: Reddit

- **r/hypotheticalphysics**: Primary venue. Post a summary with link.
- **r/math**: If the math paper is strong enough. Focus on the Gr(4,11) geometry.
- **r/MachineLearning**: The AI methodology angle.
- **Avoid r/physics**: Too high a crackpot-filter threshold for initial post.

#### 6.2d: Physics Forums / Stack Exchange

- Low priority, high risk of dismissal
- Better as a long-term presence (answering questions) than an announcement

### 6.3 Blog Launch Series

**Status**: NOT STARTED
**Priority**: MEDIUM

> **Context files for each blog post:**
>
> | Post | Key Source Files |
> |------|----------------|
> | #1 (Personal story) | `publications/PLAIN_LANGUAGE_DESCRIPTION.md`, `publications/HONEST_ASSESSMENT.md` |
> | #2 (14 failures) | `claims/FALSIFIED.md` (all 14 entries with lessons learned) |
> | #3 (Alpha derivation) | `topics/step5-alpha-mechanism.md`, `verification/sympy/alpha_enhanced_prediction.py`, S266 (C=24/11), S262 (radiative gap), S272 (index density) |
> | #4 (Lithium-7) | `claims/TIER_2_POSSIBLE.md` (BBN section), relevant BBN investigation files, S138b (blind predictions) |
> | #5 (AI methodology) | C2 deliverable (`AI_METHODOLOGY.md`) — this post is the accessible version |

**Post 1** (Launch day): "How I Used AI to Explore a Theory of Everything"
- The personal story
- Why this approach (division algebras + AI)
- What I found (summary)
- Why I might be wrong
- Invitation to evaluate

**Post 2** (Week 1): "What 14 Failed Predictions Taught Me About Physics"
- Each failure and what it revealed
- Why recording failures matters
- The difference between falsified and deprecated
- How failures improved the framework

**Post 3** (Week 2): "The Fine Structure Constant from First Principles"
- Technical walk-through of the alpha derivation
- From CCP -> n_d=4, n_c=11 -> 137+4/111
- The 0.27 ppm match and the radiative gap
- What would falsify this

**Post 4** (Week 3): "The Lithium-7 Problem and an Unexpected Solution"
- The 40-year BBN lithium puzzle
- How the framework addresses it
- Why this is interesting even if the rest is wrong

**Post 5** (Week 4): "Why AI Might Transform Theoretical Physics"
- The methodology in practice
- Hallucination defense as a general protocol
- What AI is good at and bad at in this context
- Invitation for others to use the approach

### 6.4 Academic Talks (Post-Launch)

**Status**: FUTURE
**Priority**: LOW (pursue only after initial online response)

- Contact local university physics departments for informal seminars
- AI/ML meetups (methodology angle)
- If any academic contact from 6.1 bites, ask about seminar invitations
- Prepare 30-minute and 60-minute talk versions

---

## 7. Phase 5: Ongoing Operations

**Goal**: Maintain the website, respond to feedback, continue improving the framework.
**Dependencies**: Successful launch
**Timeline**: Indefinite

### 7.1 Response Protocol

- Every serious criticism gets a documented response within 1 week
- Errors found -> immediate correction + blog post acknowledging it
- New falsified predictions -> added to FALSIFIED.md + blog post
- Maintain a public "issues" or feedback log

### 7.2 Living Documents

- Publications updated as framework develops (version tracked)
- New predictions logged publicly BEFORE checking measurements
- Verification scripts added for every new claim
- Interactive explorer updated with new predictions

### 7.3 Experiment Tracking

> **Context files:**
> - `predictions/BLIND_PREDICTIONS.md` — locked predictions with falsification commitments
> - `predictions/experimental_timeline.md` — when predictions become testable
> - `predictions/dark_matter_5gev.md` — DM prediction details
> - `registry/FALSIFICATION_REGISTRY.md` — what would disprove each claim
> - S314-S323 — DM mass formula, coupling, H-parity stability

| Experiment | Prediction | Timeline | Decisive? |
|-----------|-----------|----------|-----------|
| SuperCDMS | DM at 5.11 GeV | 2026-2027 | YES — direct falsification if excluded |
| CMB-S4 | r = 0.035 | ~2028 | YES — tensor-to-scalar ratio |
| Belle II | m_tau precision | Ongoing | Improves Band A test |
| DESI | w = -1 (exact CC) | 2025-2027 | YES — w != -1 falsifies |
| LZ/XENONnT | DM direct detection | 2025-2027 | Constrains coupling |

### 7.4 Collaboration Management

- If a researcher shows interest: establish clear collaboration terms
- License: ensure the work remains open and attributable
- Shared GitHub access for collaborators
- Regular update cadence on the blog

---

## 8. Risk Matrix

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| R1 | Dismissed as crackpot without reading | HIGH | HIGH | Lead with self-criticism, failures, 25-40% estimate. Anti-crackpot assets front and center. |
| R2 | Dismissed for AI usage | MEDIUM | HIGH | Position as rigorous methodology. 713+ scripts. Publish the methodology as a contribution in its own right. |
| R3 | Dismissed for lack of credentials | HIGH | MEDIUM | "We're not physicists. The math is checkable. Check it." Zenodo DOIs provide formal record. |
| R4 | Dismissed for "ToE" framing | MEDIUM | MEDIUM | Frame as "candidate framework worth investigating" — never "we solved physics." |
| R5 | Idea appropriated without credit | LOW | HIGH | GitHub timestamps + Zenodo DOIs + Archive.org. CC BY-SA license requires attribution. |
| R6 | Harsh criticism destroys something fundamental | LOW | HIGH | Welcome it. Respond with corrections. The framework already survived internal Red Team. |
| R7 | No one cares / total silence | MEDIUM | MEDIUM | Multiple outreach channels. The AI methodology angle has independent interest. Blog series builds audience over time. |
| R8 | Real error found in core derivation | LOW | CRITICAL | Fix it, document it, blog about it. Honest correction strengthens credibility. |
| R9 | Experiment falsifies key prediction | MEDIUM | HIGH | Document the falsification prominently. "The framework predicted X, measurement shows Y, we were wrong." This is actually a WIN for credibility (testable means scientific). |
| R10 | Website technical failure | LOW | LOW | Static site on established hosting. Minimal attack surface. GitHub serves as backup. |

---

## 9. Timeline

### Overview

```
PHASE 1 (Content)      ████████████████░░░░░░░░░░░░░░░░  Weeks 1-4
PHASE 2 (Website/UI)   ░░░░████████████████████░░░░░░░░  Weeks 2-6
PHASE 3 (Priority)     ░░░░░░░░░░░░░░░░████░░░░░░░░░░░░  Week 5
--- LAUNCH ---         ░░░░░░░░░░░░░░░░░░░░█░░░░░░░░░░░  Week 5-6
PHASE 4 (Outreach)     ░░░░░░░░░░░░░░░░░░░░████████████  Week 5+
PHASE 5 (Operations)   ░░░░░░░░░░░░░░░░░░░░████████████  Ongoing
```

### Detailed Timeline

| Week | Phase | Key Deliverables | Gate |
|------|-------|-----------------|------|
| 1 | 1a | Math paper Part I-II complete | — |
| 2 | 1a, 2a | Math paper Part III-IV; domain registered, site scaffolded | — |
| 3 | 1a, 1b, 2b | Math paper Part V + appendices; AI methodology draft; site pages built | — |
| 4 | 1b-1d, 2c-2d | Companion paper v1.0; Landscape comparison; Skeptics page; Interactive UI | Content review gate |
| 5 | 1e-1f, 3a-3c | Existing pubs updated; FAQ; GitHub public; Zenodo DOIs | Priority gate |
| 5-6 | **LAUNCH** | Website live; social media threads; blog post #1 | **Launch gate** |
| 6 | 4a | Academic outreach emails sent | — |
| 7-8 | 4b-4c | Blog posts #2-3; monitor responses | — |
| 8+ | 4d, 5 | Blog posts #4-5; talks if invited; ongoing operations | — |

### Gates

| Gate | Criteria | Who Decides |
|------|----------|-------------|
| Content review | All Phase 1 documents at v1.0; internal consistency verified | Author |
| Priority | GitHub public, Zenodo DOIs minted, Archive.org snapshot taken | Author |
| Launch | Website functional, landing page compelling, at least math paper + skeptics page live | Author |

---

## 10. Status Tracker

Track progress on individual deliverables across sessions.

### Phase 1: Content

| ID | Deliverable | Status | Sessions | Notes |
|----|------------|--------|----------|-------|
| C1a | Math Foundations v1.0 | COMPLETE | S333-S343 | Full rewrite in 6 chunks. 2133 lines, 20 sections + 4 appendices, 46 verification scripts. |
| C1b | Interpretive Companion v1.0 | IN PROGRESS | S345 | Chunk 1/6 complete (Secs 1-4, 456 lines). Full rewrite mirroring math paper. |
| C2 | AI Methodology document | NOT STARTED | | New document |
| C3 | Landscape Comparison | NOT STARTED | | New document |
| C4 | For Skeptics page | COMPLETE | S327, S332 | v2.0 rewrite with Red Team v3.0 integration at `launch/content/FOR_SKEPTICS.md` |
| C5 | Update existing publications | NOT STARTED | | THESIS, TECHNICAL_SUMMARY, O&R, PLAIN_LANGUAGE, PHYSICIST, QUICKSTART |
| C6 | FAQ | NOT STARTED | | New document |

### Phase 2: Website & UI

| ID | Deliverable | Status | Sessions | Notes |
|----|------------|--------|----------|-------|
| W1 | Domain registration | NOT STARTED | | Decision needed: .com vs .org |
| W2 | Tech stack selection | COMPLETE | S346 | Astro 5 + Tailwind v3 + KaTeX + React islands, targeting Vercel |
| W3 | Site scaffolding | COMPLETE | S346 | 10 routes, BaseLayout, nav/footer, mobile menu, data pipeline |
| W4 | Landing page | COMPLETE | S346 | Hero, 3-column, highlights, stats bar, footer tagline. Visually verified. |
| W5 | Prediction explorer | COMPLETE | S349 | React island with filter/sort/expand. 37 predictions from JSON. Tier/status/domain/blind filters. Visually verified. |
| W6 | Derivation chain viewer | COMPLETE | S351 | React island with interactive DAG. 5 chains (alpha, Weinberg, Omega_m, gauge, QM). 49 nodes, 83 edges. Layered SVG layout, click-for-details, hover highlighting. 9.4 KB (3.0 KB gzip). |
| W7 | Division algebra visualizer | NOT STARTED | | |
| W8 | Publications rendering | COMPLETE | S349 | Content collection + Astro rendering. 2133-line math doc with KaTeX. TOC sidebar (desktop sticky + mobile collapsible). Sync script for source updates. |
| W9 | Verification portal | COMPLETE | S354 | React island with curated scripts browser. 8 featured "Start here" + 19 curated = 27 scripts. Domain filtering, card expand/collapse. Stats bar, run instructions, methodology. 5.98 KB (1.91 KB gzip). |
| W10 | Blog infrastructure | NOT STARTED | | |

### Phase 3: Priority

| ID | Deliverable | Status | Sessions | Notes |
|----|------------|--------|----------|-------|
| P1 | GitHub public | NOT STARTED | | Decision: public vs mirror |
| P2 | Zenodo DOIs | NOT STARTED | | |
| P3 | Archive.org snapshots | NOT STARTED | | |
| P4 | arXiv submission | NOT STARTED | | Stretch goal |

### Phase 4: Outreach

| ID | Deliverable | Status | Sessions | Notes |
|----|------------|--------|----------|-------|
| O1 | X/Twitter launch thread | NOT STARTED | | Draft before launch |
| O2 | Hacker News post | NOT STARTED | | |
| O3 | Reddit posts | NOT STARTED | | |
| O4 | Academic emails | NOT STARTED | | 6 target researchers |
| O5 | Blog post #1 | NOT STARTED | | Launch day |
| O6 | Blog post #2 | NOT STARTED | | Week 1 |
| O7 | Blog post #3 | NOT STARTED | | Week 2 |
| O8 | Blog post #4 | NOT STARTED | | Week 3 |
| O9 | Blog post #5 | NOT STARTED | | Week 4 |

---

## 11. Decision Log

Track key decisions made during execution.

| Date | Decision | Rationale | Decided By |
|------|----------|-----------|------------|
| 2026-02-09 | Self-hosted website as primary vehicle (not journal paper) | Avoids gatekeeping on credentials; allows iterative improvement; UI provides unique value | Author |
| 2026-02-09 | Lead with honesty, not boldness | Anti-crackpot strategy; the 25-40% estimate and 14 failures are stronger than the claims themselves | Author + Claude |
| 2026-02-09 | Astro 5 + Tailwind v3 + KaTeX + React islands | Static-first with interactive islands; first-class MDX; minimal bundle; Vercel free tier | Claude (S346) |
| 2026-02-09 | Hand-curated predictions JSON over automated parsing | Markdown files use irregular formatting; hand-curated ensures accuracy for 37 entries | Claude (S346) |

---

## 12. Session History

| Session | Date | Focus | Accomplishments | Next |
|---------|------|-------|----------------|------|
| S354 | 2026-02-09 | Phase 2: Verification Portal | W9 COMPLETE. React island with curated script browser. 8 featured + 19 curated = 27 scripts. Domain filtering (8 domains), card expand with formula/measured/tests/run-command. Stats bar, run instructions, methodology section. 5.98 KB (1.91 KB gzip). Build: 10 pages, 0 errors, 2.17s. | W7 (Division algebra visualizer), W10 (Blog) |
| S351 | 2026-02-09 | Phase 2: Derivation Chain Viewer | W6 COMPLETE. React island with interactive DAG. 5 chains, 49 nodes, 83 edges. Layered SVG, click-for-details, hover highlighting. 9.4 KB (3.0 KB gzip). Build: 10 pages, 0 errors, 2.95s. | W9 (Verification portal), W7 (Division algebra visualizer) |
| S349 | 2026-02-09 | Phase 2: Prediction Explorer + Publications | W5+W8 COMPLETE. React explorer (37 predictions, filter/sort/expand). Math Foundations rendered (2133 lines, KaTeX, TOC sidebar). Build: 10 pages, 0 errors, 2.2s. | W6 (Derivation chain viewer), W9 (Verification portal) |
| S346 | 2026-02-09 | Phase 2: Website scaffolding + landing page | W2-W4 COMPLETE. Astro 5 + Tailwind v3 + KaTeX. 10 routes, BaseLayout, landing page. 37-entry predictions.json. Build 0 errors. | W5 (Prediction Explorer), W8 (Publications rendering) |
| S345 | 2026-02-09 | C1b: Interpretive Companion Chunk 1 | Part I complete (Secs 1-4, 456 lines). Full rewrite mirroring math paper v1.0. All [A-PHYSICAL] flagged, derivation chains, falsification criteria per section. | Chunk 2: Part II (Secs 5-8) |
| S343 | 2026-02-09 | C1a: Math Foundations Chunk 6 (FINAL) | Appendices A-D complete (~210 lines). Radon-Hurwitz/CONJ-A3 proof, FFT/CONJ-B1 proof, spectral convergence/CONJ-A1, verification script index (46 scripts). Cross-ref fixes (Thm 4.1->4.5, Def 4.3->4.6). Final consistency review PASS. **Document v1.0 at 2133 lines. C1a COMPLETE.** | Next: C1b (Interpretive Companion v1.0) |
| S342 | 2026-02-09 | C1a: Math Foundations Chunk 5 | Part V complete (Secs 17-20, ~400 lines). Glueball mass formula, QM from axioms (3 routes, 7 properties), Einstein equations from Lovelock+crystallization, tree-to-dressed bands. Document v0.95 (~2100 lines). Zero TODOs. | Chunk 6: Appendices A-D + final review |
| S340 | 2026-02-09 | C1a: Math Foundations Chunk 4 | Part IV complete (Secs 13-16, ~500 lines). Democratic counting + Schur, alpha chain (137+4/111, C=24/11), Weinberg mixing ratio (28/121 + one-loop), partition fraction (63/200). Document v0.9 (~1700 lines). Zero TODOs. | Chunk 5: Part V (Secs 17-20) |
| S324 | 2026-02-09 | Launch planning | Created LAUNCH_PLAN.md v1.0 | Author review; begin Phase 1 execution |
| S327 | 2026-02-09 | C4: For Skeptics | Drafted FOR_SKEPTICS.md v1.0 (7 sections, all key numbers verified) | v2.0 rewrite with Red Team v3.0 |
| S332 | 2026-02-09 | C4: For Skeptics v2.0 | Rewrote FOR_SKEPTICS.md v2.0 with Red Team v3.0 integration. Added DM section, colored pNGB, "What Has Improved" table, 3 new criticisms, LLM Challenge v1/v2/v3 refs, Monte Carlo gap note. Updated LAUNCH_PLAN.md (20-35%->25-40%, Appendix B, C4 status). | Author review; next: C1a or C2 |
| S338 | 2026-02-09 | C1a: Math Foundations Chunk 3 | Part III complete (Secs 9-12, ~470 lines). End(V) decomposition, pipeline 121->55->27->18->12, gauge group u(1)+su(2)+su(3), generation structure from Hom(H,R^7). ~1200 total lines. Zero TODOs. | Chunk 4: Part IV (Secs 13-16) |
| S334 | 2026-02-09 | C1a: Math Foundations Chunk 2 | Part II complete (Secs 5-8, ~344 lines). Gr+(4,11) topology, crystallization dynamics/CONJ-B1, evaluation map, Lorentz signature. 734 total lines. Zero TODOs. | Chunk 3: Part III (Secs 9-12) |
| S333 | 2026-02-09 | C1a: Math Foundations Chunk 1 | Full rewrite Part I (Secs 1-4, 390 lines). Documented 6-chunk plan. CCP axioms, division algebras, forced dimensions, number theory backbone. Zero TODOs. | Chunk 2: Part II (Secs 5-8) |

---

## Appendix A: Content Style Guide

### Tone Rules

1. **Confident where the math is solid**: "The Radon-Hurwitz theorem forces..." (this is a theorem)
2. **Cautious where it's conjecture**: "The framework suggests..." or "A candidate interpretation..."
3. **Honest where it's uncertain**: "We don't know if this is real physics."
4. **Never dismissive of other approaches**: "String theory's mathematical contributions are permanent."
5. **Never apologetic about being amateur**: State it as fact, then move on to the math.

### Formatting Rules

- Every claim has a confidence tag
- Every number has a verification script reference
- Every section has "what would falsify this"
- All experimental values cite CODATA 2022 or PDG 2024
- No calculation in text without computational verification

### AI Disclosure

Standard footer for all publications:
```
This work was developed by [Author Name] with AI assistance (Claude, Anthropic).
All mathematical claims are computationally verified via 713+ SymPy scripts.
The AI-assisted methodology is documented in [AI_METHODOLOGY link].
```

---

## Appendix B: Key Numbers Quick Reference

For consistent use across all materials:

| Quantity | Value | Source |
|----------|-------|--------|
| Verification scripts | 713+ | verification/sympy/ directory |
| Pass rate | 99.8% | S289 hallucination audit |
| Sub-10 ppm predictions | 12 (9 robust) | claims/TIER_1_SIGNIFICANT.md |
| Total predictions | 63+ | claims/README.md |
| Falsified predictions | 14 | claims/FALSIFIED.md |
| Retractions | 3 | S291, S319, S320 |
| Blind predictions | 9 | predictions/BLIND_PREDICTIONS.md |
| Blind CMB within 1 sigma | 6/7 | predictions/BLIND_PREDICTIONS.md |
| P-value (blind only) | 2.5e-7 | framework/STATISTICAL_ANALYSIS_HONEST.md |
| Irreducible assumptions | 4 (0 conjectural) | framework/IRREDUCIBLE_ASSUMPTIONS.md |
| Self-assessed probability | 25-40% | registry/RED_TEAM_SUMMARY_V3.md (S330) |
| Sessions completed | 330+ | sessions/INDEX.md |
| Building block percentile (1%) | 51st (average) | S170 Monte Carlo |
| Registered predictions | P-001 through P-022 | predictions/BLIND_PREDICTIONS.md |

---

*Status: DRAFT plan for launching a speculative theoretical framework. Not yet approved for execution.*
*Version: 1.0 | Created: 2026-02-09 | Author: Chris + Claude*
