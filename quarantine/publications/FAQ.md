# Frequently Asked Questions

**Last Updated**: 2026-02-09 (Session S359)
**Version**: 1.0
**Purpose**: Fastest way for a newcomer to understand what this is, what it claims, and how to engage.
**Audience**: Anyone arriving at the project for the first time.
**Status**: CURRENT
**Reading Time**: ~5 minutes

## Key References

| File | Role |
|------|------|
| `publications/THESIS.md` | The central claim in condensed form |
| `publications/PLAIN_LANGUAGE_DESCRIPTION.md` | Non-specialist explanation |
| `publications/HONEST_ASSESSMENT.md` | Candid self-evaluation |
| `publications/OBJECTIONS_AND_RESPONSES.md` | 14 anticipated criticisms addressed in depth |
| `publications/LANDSCAPE_COMPARISON.md` | Comparison with string theory, LQG, NCG, and others |
| `publications/AI_METHODOLOGY.md` | How AI was used and how hallucinations are caught |

---

## The Basics

### What is Perspective Cosmology?

A speculative mathematical framework that asks: *What is the minimum mathematical structure required for observation to exist?* It claims the answer forces the Standard Model of particle physics, general relativity, 3+1 spacetime dimensions, and specific values of fundamental constants. It was built by an amateur researcher with AI assistance. It has not been peer-reviewed.

### What does it claim?

Three sentences: (1) Consistent observation requires division algebras --- four special number systems with dimensions 1, 2, 4, 8 --- and this is a proven theorem, not a choice. (2) A selection principle called the Consistent Completeness Principle (CCP) applied to these algebras forces two integers: crystal dimension n_c = 11 and defect dimension n_d = 4. (3) From those two integers alone, the framework derives the gauge group of the Standard Model, quantum mechanics, Einstein's equations, three generations of fermions, and 63+ physical constants including the fine structure constant to 0.27 parts per million.

### Is this real physics?

Maybe. The framework's own adversarial review (a three-critic Red Team, Session 330) estimates a 25--40% probability that this captures genuine physics. A Monte Carlo test showed the building blocks are not statistically special at percent-level precision. Most numerical matches were found *after* knowing the measured values. But 9 blind predictions (made before checking measurements) succeeded, with a combined P-value of ~2.5 x 10^-7. We genuinely do not know if this is an elaborate coincidence or a real insight.

### Who made this?

Christopher M Morin --- an amateur with an applied mathematics background, no physics PhD, and no university affiliation. The work uses AI assistance (Claude, Anthropic) extensively across 370+ sessions. The AI-assisted methodology, including hallucination defense and verification infrastructure, is documented in detail and positioned as a replicable protocol. See `publications/AI_METHODOLOGY.md`.

---

## The Math

### What are division algebras, and why do they matter?

Division algebras are number systems where you can always divide (no two nonzero elements multiply to give zero). The Frobenius-Hurwitz theorem (1877/1898) proves that exactly four exist over the real numbers: the reals (dimension 1), complex numbers (2), quaternions (4), and octonions (8). The framework claims these are the mathematical DNA of physics --- spacetime is 4-dimensional because the quaternions are the largest associative division algebra, and the forces of nature arise from the symmetry groups of the others.

### What is the CCP?

The Consistent Completeness Principle is the framework's central axiom. It requires that the mathematical structure describing perspectives on a complete object be *maximally consistent* --- the largest structure that avoids contradictions. This replaces a choice (which algebra? which field? which dimension?) with a derivation: CCP forces the complex field F = C, forces crystal dimension n_c = 11, and forces defect dimension n_d = 4. Everything downstream follows from those forced values. Whether CCP is the right principle is the framework's deepest open question.

### What predictions does it make?

**Already testable:**
- Dark matter mass: 5.11 GeV (SuperCDMS, 2026--2027)
- Tensor-to-scalar ratio: r = 0.035 (CMB-S4, ~2028)
- Neutrino mass ordering: normal, with m_1 = 0 (JUNO, ~2027)
- Dark energy equation of state: w = -1 exactly (DESI, ongoing)
- No 95 GeV scalar particle (LHC Run 3, now)

**Future facilities:**
- Higgs coupling modification: kappa_V = 0.983 (FCC-ee)
- Triple Higgs coupling: kappa_lambda = 0.9497 (HL-LHC)

Each prediction has explicit falsification criteria. If r != 0.035 or dark matter is found outside 4.5--5.7 GeV, the framework is wrong and we will document why.

---

## Honest Assessment

### What has this gotten wrong?

14 predictions have been falsified, including 3 formal retractions (a Grassmannian topology error, an SU(3) misidentification, and a dark states prediction). These are documented in `claims/FALSIFIED.md` alongside the successes. We record failures because that is how science works.

### How is this different from string theory, loop quantum gravity, or other unification programs?

Every unification program must *choose* something: string theory chooses a compactification, LQG chooses how to couple matter, Connes' NCG chooses a spectral triple, E8 theory chooses the embedding. The framework's claim is that CCP replaces choice with derivation. Whether that claim holds is unproven. A detailed, respectful comparison is in `publications/LANDSCAPE_COMPARISON.md`.

### What would prove this wrong?

The most decisive tests: (1) r measured outside 0.025--0.045 by CMB-S4 kills the inflation derivation. (2) Dark matter excluded at 4.5--5.7 GeV by SuperCDMS kills the mass formula. (3) A 95 GeV scalar confirmed at 5-sigma kills axiom AXM_0109. (4) Neutrino mass ordering measured as inverted by JUNO kills P-017. Each of these is a clean kill, not a "we can adjust" situation.

---

## How to Engage

We are actively seeking engagement from visitors. This is not a finished product --- it is a candidate framework that improves through external pressure. Here is what we need from different perspectives.

### I'm a mathematician. What would help?

The framework rests on Grassmannian geometry, Lie algebra decompositions, and division algebra representation theory. The most valuable contribution a mathematician could make is to examine the derivation chains for logical gaps, particularly: (1) the pipeline from End(R^11) = 121 dimensions down to the 12-dimensional gauge algebra, (2) the Schur's lemma argument for democratic coupling on Gr(4,11), and (3) the CCP axiom itself --- does it actually force what we claim it forces? Proofs or counterexamples for any step would be transformative.

### I'm a physicist. What would help?

Three things. First: *adversarial criticism*. We want to know where the derivation chains break, where hidden assumptions lurk, and where we are fooling ourselves. The Objections and Responses document (`publications/OBJECTIONS_AND_RESPONSES.md`) addresses 11 known criticisms --- but the one we haven't thought of yet is the most valuable. Second: *comparison with known results*. Does the tree-level Weinberg angle make sense in the RG context? Is the dark matter mass formula physically plausible? Third: *experimental feasibility*. Are the predictions actually testable with the stated experiments and timelines?

### I'm an experimentalist. What would help?

The framework predicts specific values for quantities that specific experiments will measure. If you work on SuperCDMS, CMB-S4, JUNO, DESI, Belle II, or HL-LHC, the framework makes a prediction relevant to your experiment. We want to know whether our stated precision and falsification criteria are realistic, and whether there are additional experimental signatures we should derive.

### I'm a developer or data scientist. What would help?

The 736+ verification scripts are the backbone of the framework's credibility. A developer who spot-checks scripts for correctness, runs them independently, identifies edge cases, or improves the test infrastructure provides direct value. The website's interactive tools (prediction explorer, derivation chain viewer) are also open to contributions.

### What kind of criticism is most useful?

All kinds, but especially: (1) *mathematical errors* in derivation chains --- the most immediately actionable feedback, (2) *hidden assumptions* we have not identified --- the "you're assuming X without realizing it" class of criticism, (3) *alternative explanations* for the numerical matches --- if you can produce 137 + 4/111 from a completely different starting point, that weakens our claim, (4) *statistical critiques* of the blind prediction analysis --- is the P-value calculation honest?

### Are you open to collaboration or partnership?

Yes. We are actively seeking collaborators, especially professional physicists or mathematicians willing to subject specific derivation chains to rigorous scrutiny. Collaboration could range from a single email pointing out an error to ongoing joint investigation of open problems. We are also open to co-authorship on any result that emerges from collaborative work. Contact: christopher.morin@perspectivecosmology.com.

---

## Getting Started

### How can I check the math myself?

Three tree-level formulas you can verify in 30 seconds: (1) 1/alpha tree = 15211/111 = 137.036036 (0.27 ppm from CODATA). (2) sin^2(theta_W) tree = 28/121 = 0.23140 (0.08% from PDG). (3) Omega_m = 63/200 = 0.315 (exact match to Planck 2018). With framework-derived radiative corrections (rational coefficients, no free parameters): 1/alpha dressed = 137.035999177 (0.0006 sigma); sin^2 dressed = 0.23122 (0.00 sigma). For deeper verification: clone the repository and run any of the 736+ SymPy scripts --- each states its assumptions, performs exact arithmetic, and reports PASS/FAIL.

### Where should I start reading?

Depends on who you are:

| You are... | Start here |
|------------|------------|
| Curious but non-technical | `publications/PLAIN_LANGUAGE_DESCRIPTION.md` |
| A physicist with 5 minutes | `publications/EXECUTIVE_SUMMARY.md` |
| A skeptic | `publications/OBJECTIONS_AND_RESPONSES.md` |
| A mathematician | `publications/PC_MATHEMATICAL_FOUNDATIONS.md` |
| Interested in the AI methodology | `publications/AI_METHODOLOGY.md` |
| Wanting the full picture | Start with `EXECUTIVE_SUMMARY.md`, then `HONEST_ASSESSMENT.md`, then `PC_MATHEMATICAL_FOUNDATIONS.md` |

---

## Revision History

| Version | Date | Session | Changes |
|---------|------|---------|---------|
| 1.0 | 2026-02-09 | S359 | Initial version |

---

*This work was developed by Christopher M Morin with AI assistance (Claude, Anthropic). All mathematical claims are computationally verified via 736+ SymPy scripts. The AI-assisted methodology is documented in `publications/AI_METHODOLOGY.md`.*

*Status: Speculative theoretical framework. Not peer-reviewed. Amateur work with AI assistance.*
*Affiliation: Amateur researcher with AI assistance*
