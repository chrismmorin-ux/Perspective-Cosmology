---
title: "How I Used AI to Explore a Theory of Everything"
date: 2026-02-09
description: "The personal story behind Perspective Cosmology — why this approach, what I found, and why I might be wrong."
category: Meta
draft: false
---

## The Number

Every physicist knows 137.

The fine structure constant governs the strength of electromagnetism. Its reciprocal is approximately 137.036. This number determines the size of atoms, the color of stars, the fact that chemistry works at all. Richard Feynman called it "one of the greatest damn mysteries of physics." Nobody knows why it has this value, and it is dimensionless.

I think I might know. Or I might be fooling myself. After 350+ sessions working with an AI on this problem, I honestly can't tell which, and I think that uncertainty is worth sharing.

Here's the formula: 1/α = (4^2 + 11^2) + 4/111 = 15211/111 = 137.036036...

The measured value is 137.035999177. That's a match to 0.27 parts per million — from integers alone.  And we tighten the results from there.

If that gives you a jolt of interest followed immediately by immense skepticism, good. Hold onto both of those feelings. This entire project lives in the space between them.

## Who I Am (And Am Not)

My name is Christopher Morin. I have a B.S. in Applied Mathematics from a long time ago, and only engaged recreationally with theoretical physics (shoutout to PBS Spacetime for the engaging content). I spent 12 years as an operator in USAF Special Operations, doing zero complex math, then moved on to running operations and founding teams for tech startups. I do not have a physics PhD. I am not affiliated with any university. I am, by any standard definition, an amateur.

I'm telling you this upfront because it matters. Professional physicists have earned their skepticism toward outsiders claiming breakthroughs. Most outsider theories are wrong. This one probably is too. But I've tried to do something unusual with that probability: measure it, document it, and publish the failures alongside the successes.

## Why Division Algebras

The idea didn't start with 137. It started with a simpler question: what is the minimum mathematical structure required for observation to exist?

I was pondering why gravity and quantum physics seemed so disconnected. We have this macroscopically big but objectively weak force, then other forces that get progressively smaller and weirder. A lot of people are working on that problem. I wondered: what if we can't see that gravity is connected because it's actually behind us in visibility, and it was our perspective that stopped us from seeing the connection?

If that were the case, then all the laws of physics would be fixed and static — just kind of exist, like a block on a shelf. But people are already working on a block universe, and a static block doesn't inspire confidence that the crazy curves of physics would be satisfied. What would happen at the corners? What's the middle made out of? And thus the Crystal was born: a higher-dimensional perfect static object, maximally complex without contradiction. Perspective was the dynamic part, driving motion through it. Physics is then perspective literally moving through this higher-dimensional object, and the chain of perspectives as they move could be time.

[Here is the exact starting conversation](https://chatgpt.com/c/6976b092-cca0-832d-9369-d0ba4a382c90), where I first ran the idea through ChatGPT. Forgive the spelling and grammar — it was late — but I've committed to 100% transparency. When we later applied the framework's own logic recursively — perspective examining itself — the gaps traced back through the division algebras in reverse order: 7, 3, 1. A pure mathematical result, verified computationally, with implications I'm still working through. Some of the initial ideas didn't hold up, but the core did.

If anything is going to be observed at all, you need distinguishability (different things look different), consistency (observations compose without contradiction), and partiality (an observer can't access everything — otherwise there's no "observer" separate from "reality"). These aren't physics assumptions. They're the prerequisites for having a physics at all.

The consistency requirement is the sharp one. It demands that the algebra governing transitions between observational states has no "zero divisors" — no two nonzero things that multiply to give nothing. And there's a theorem (Frobenius 1877, Hurwitz 1898) that says exactly four such algebras exist over the real numbers:

- Real numbers (dimension 1)
- Complex numbers (dimension 2)
- Quaternions (dimension 4)
- Octonions (dimension 8)

That's it. Not a choice — a mathematical fact. The framework claims these four algebras, with dimensions {1, 2, 4, 8}, are the DNA of physics.

From those four numbers, you can derive two more: the "crystal dimension" n_c = 11 (the sum of imaginary dimensions: 1 + 3 + 7), and the "defect dimension" n_d = 4 (the largest associative division algebra). Everything else follows from n_c = 11 and n_d = 4.

Spacetime is 4-dimensional because time evolution must be associative and the quaternions are the largest associative division algebra. The Standard Model gauge group SU(3) x SU(2) x U(1) emerges from the symmetry groups of the octonions, quaternions, and complex numbers. Three generations of fermions come from the 3 imaginary quaternion dimensions.

These connections aren't new to me — professional physicists like Cohl Furey, Geoffrey Dixon, and Latham Boyle have explored division algebras and particle physics seriously. What I pushed further, with AI help, was the numerical predictions and trying to see where my crystal broke.

## The AI Collaboration

I should explain the role of AI in this work, because it's central and because it's where most people's alarm bells go off.

I found incredible timing with AI, and was well versed in the potential and limitations of AI from my work.  I chose to launch a personal project and used Claude (Anthropic's AI) as a research collaborator across 350+ sessions. The AI didn't dream up the framework — I brought the core idea. But it did something I couldn't do alone: maintain rigorous tracking of every claim, assumption, and derivation chain across thousands of pages of mathematical argument. 

Every mathematical claim in the project is backed by a SymPy verification script — over 700 of them, with a 99.8% pass rate. No formula appears in any document without a script confirming the arithmetic. When the AI makes a mathematical error (and it does), the scripts catch it. We built a formal hallucination defense protocol: every new claim gets a risk score, and anything scoring high requires independent verification from multiple angles.

This doesn't prove the physics is right. It proves the arithmetic is right. There's an enormous difference, and conflating the two is exactly the kind of mistake an amateur might make. I'm trying not to.

## What Came Out

Starting from those four division algebras and applying a single selection principle — roughly, choose the maximal structure that remains consistent — the framework produces:

**Structure**: The Standard Model gauge group, 3+1 spacetime dimensions, quantum mechanics (fully derived from the axioms), Einstein's field equations, Yang-Mills theory with a mass gap and glueball spectrum.

**Numbers**: Over 60 physical constants, including:

- 1/α = 137 + 4/111 (fine structure constant, 0.27 ppm match)
- sin²(θ_W) = 28/121 (Weinberg angle, within 0.08%)
- Ω_m = 63/200 = 0.315 (matter density, within Planck measurement uncertainty)
- H₀ = 337/5 = 67.4 km/s/Mpc (Hubble constant, matches CMB measurement)
- m_p/m_e = 1836 + 11/72 (proton-to-electron mass ratio, 0.06 ppm)

Nine predictions were made blind — locked before checking measurements. Six of seven CMB predictions landed within 1 sigma of Planck satellite values.

All of these numbers come from the same handful of integers: {1, 2, 4, 8, 11}. No parameters are adjusted. No curve fitting.

## What Went Wrong

Here is where most popularizations of speculative physics stop. I'm not going to do that.

**14 predictions have been falsified.** Including an early Weinberg angle formula that was simply wrong, a Grassmannian topology claim that confused real and complex cases, an SU(3) misidentification, and a dark matter prediction that didn't survive scrutiny. Each failure is documented in detail, with lessons learned.

**The building blocks aren't special.** A Monte Carlo test generated 5,000 random sets of 7 small integers and checked how well they match physics constants. Result: at 1% precision, our building blocks score at the 51st percentile. Dead average. Any seven small integers do roughly as well.

That was humbling. It means the percent-level matches — which look impressive individually — prove nothing. The statistical evidence comes entirely from the sub-ppm matches and the blind predictions. Everything else could be coincidence.

**4 irreducible assumptions remain.** I originally claimed zero free parameters. That was wrong, and I corrected it. Honest accounting reveals 4 assumptions the framework doesn't derive from axioms: one structural, two physical, and one imported from standard physics. Down from 10 earlier in the project, but not zero.

## The Honest Odds

The framework runs a formal adversarial review — a Red Team of three AI critics specifically tasked with finding flaws. After the most recent review, the consensus estimate is:

**25-40% probability that this captures genuine physics.**

That's roughly one in three. Here's what drives the range:

*Arguments for the low end*: Most numerical matches are post-hoc. An amateur with AI could unconsciously overfit. No human expert has reviewed the derivation chains. The building blocks aren't statistically special.

*Arguments for the high end*: Blind predictions succeed with P-value ~2.5 x 10^-7. Structural derivations — gauge groups, quantum mechanics, Einstein's equations — can't be produced by random number matching. The framework is coherent across particle physics, cosmology, and the CMB. The same five integers work everywhere.

The core question that cannot be resolved internally: *Were these formulas derived from first principles, or discovered by searching and then justified post-hoc?* I genuinely don't know.

## What Happens Next

The framework makes specific, falsifiable predictions:

- **Dark matter particle mass: 5.11 GeV** — testable by SuperCDMS (2026-2027)
- **Tensor-to-scalar ratio: r = 0.035** — testable by CMB-S4 (~2028)
- **Neutrino mass ordering: normal, lightest mass = 0** — testable by JUNO (~2027)
- **No 95 GeV scalar particle** — testable now at the LHC
- **Dark energy equation of state: w = -1 exactly** — testable by DESI (ongoing)

If these predictions fail, the framework is wrong. Not "needs adjustment" — wrong. I will document why.

If they succeed, it becomes much harder to dismiss as coincidence.

## An Invitation

I'm not asking you to believe this. I'm asking you to check it.

The entire repository is public: every verification script, every session transcript, every documented failure, every assumption tagged and tracked. If you find an error — a mathematical mistake, a hidden assumption I haven't identified, a better explanation for the numerical matches — that is the most valuable thing you could contribute.

Three formulas to verify yourself in 30 seconds:

1. 15211 / 111 = 137.036036... (compare to measured α⁻¹ = 137.035999)
2. 28 / 121 = 0.231405... (compare to sin²θ_W = 0.23122)
3. 63 / 200 = 0.315 (compare to Ω_m = 0.315 ± 0.007)

Then decide for yourself whether the derivation chains are real or whether I'm pattern-matching.

I think there's about a one-in-three chance I've found something. I've spent 350+ sessions building the infrastructure to let you decide.

---
