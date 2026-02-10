---
title: "What 14 Failed Predictions Taught Me About Physics"
date: 2026-02-09
description: "Every failure documented, every lesson extracted. Why recording what went wrong matters more than celebrating what went right."
category: Results
draft: false
---

## Why I'm Writing About Failure

Most people who think they've found something in physics will tell you about their successes. I'm going to start with my failures, because I think they're more important.

Over 350+ sessions of working with AI to explore whether division algebra geometry can generate known physics, I've made 14 predictions that turned out to be wrong. Not "needs refinement" wrong. Wrong. Documented, tested, and filed under "that didn't work."

I'm publishing this because of a simple belief: if you only show people your hits, you're running a con. Maybe not intentionally, but the effect is the same. Selection bias — remembering the wins, forgetting the losses — is the single biggest threat to amateur theoretical physics. The only defense is radical transparency.

So here are my losses.

## The Four That Tell the Best Stories

### Failure #1: The Weinberg Angle That Wasn't (F-1)

My very first attempt at the Weinberg angle was sin^2(theta_W) = 2/25 = 0.08.

The measured value is 0.231. I was off by 65%.

This wasn't a subtle discrepancy or a matter of interpretation. It was a small fraction of small integers that happened to feel right. I'd taken two numbers from the framework, divided one by the other, and gotten something that looked physics-adjacent. It wasn't. It was numerology — the exact thing I was trying to avoid.

The lesson was immediate and permanent: simple fractions of small integers are not sufficient. You need actual mathematical structure connecting the numbers to the physics. The formula that eventually worked — sin^2(theta_W) = 28/121 — comes from a specific Schur's lemma argument about how the division algebras decompose the electroweak sector. The tree value matches to within 0.08%; with a framework-derived radiative correction, the dressed value matches to 0.00 sigma. The difference between 2/25 and 28/121 isn't precision. It's the difference between guessing and deriving.

### Failure #2: The Sound Horizon Mirage (F-8, F-9)

This one is two failures that looked like one success.

The framework predicted the sound horizon — the distance sound waves traveled in the early universe before recombination — using two numbers: eta* = 337 Mpc (a conformal distance) and c_s = 3/7 (a sound speed). The product gave r_s = 337 x 3/7 = 144.43 Mpc. The measured value is 144.48 Mpc. A 0.03% match. Beautiful.

Except both factors were wrong.

When I actually computed the conformal distance integral using the framework's own cosmological parameters, I got 280 Mpc, not 337. That's a 17% error. And the sound speed at recombination is 0.454, not 0.429 (which is 3/7). That's a 6% error. Two wrong numbers, each off by double digits, multiplying to give a right answer.

This is the most dangerous kind of failure in numerology: compensating errors. If I had only checked the product, I would have published it as a triumph. Instead, I eventually checked each factor independently, and the whole thing collapsed.

The sound horizon prediction survived — because the framework's cosmological parameters (H_0 = 337/5, Omega_m = 63/200) produce the correct r_s when you run the actual integral through standard physics. The parameters are good. My decomposition of them was wrong.

Lesson: when a product of two quantities matches a measurement, always check both factors independently. Always.

### Failure #3: The Cosmological Constant Sign (F-10)

For months, I had what appeared to be a fatal contradiction: the framework's tilt potential gave a negative cosmological constant, but the universe is accelerating, which requires a positive one. This was listed as an active falsification — a sign that the whole edifice might be broken at the foundation.

Then I found the error. It was a sign convention mistake.

The framework had written T_mu_nu = -g_mu_nu V(epsilon*), but the correct relationship between the Lagrangian and the stress-energy tensor means it should be T_mu_nu = +g_mu_nu V(epsilon*). One sign flip. The kind of thing a professional physicist would catch in a referee report.

With the correct convention, V(epsilon*) < 0 gives Lambda > 0 — exactly the right sign. This is actually standard physics: any Mexican-hat potential with a negative minimum gives a positive cosmological constant. The same thing happens with the Higgs.

The magnitude problem remains — the framework gives a cosmological constant that's 10^111 times too large, which is the standard cosmological constant problem that everyone has. But the sign contradiction was a bookkeeping error, not a physics error.

Lesson: sign conventions in general relativity are treacherous. Track L vs V vs T_mu_nu vs Lambda with paranoid care. And if you're an amateur, this is exactly the kind of error you should expect to make.

### Failure #4: The Higher CMB Peaks (F-7)

This is my cleanest failure, and I'm almost proud of it.

The framework successfully predicts the positions of the first three CMB acoustic peaks using division algebra ratios. So I made a blind prediction — locked before checking measurements — that the pattern would extend to peaks 4, 5, and 6.

It didn't. The predictions were off by 14-19%, all in the same direction. The pre-committed falsification criteria were clear, and the predictions failed them cleanly.

Why? Because higher acoustic peaks are dominated by Silk damping and other detailed baryon physics that simple division-algebra scaling doesn't capture. The framework has a validity boundary, and I found it.

This is actually good news, in a strange way. A framework that predicts everything is suspicious. A framework that works in some regime and fails in another is behaving like physics. The question is whether the boundary is principled or whether I'm just declaring victory where the numbers happen to work.

I don't have a fully satisfying answer to that question.

## The Other Ten

| # | Claim | Error | What Went Wrong |
|---|-------|-------|-----------------|
| F-2 | Electroweak sector has 5 dimensions | Logically impossible | Violated the Gell-Mann-Nishijima constraint. Hidden numerology dressed as derivation. |
| F-3 | Alpha still equals 1/137 at GUT scale | 1/alpha(GUT) ~ 1/42, not 1/137 | Formula works at low energy only. Didn't account for running. |
| F-4 | Visible fraction 58/137 from crystallization | No mechanism found | Some numbers may be outputs, not inputs. |
| F-5 | sin^2(theta_W) = 3/8 at unification | Borrowed, not derived | Claimed a 1970s GUT result as a framework derivation. |
| D-1 | Newton's G from perspective count | ~50% error | Order-of-magnitude match. Proves nothing. |
| D-2 | Planck length from perspectives | ~10x error | Not even order-of-magnitude. |
| D-3 | Bekenstein-Hawking factor of 4 | Proportionality only | Got S proportional to A but couldn't derive the factor. |
| D-4 | Einstein equations from gamma-structure | No construction | Claimed derivation without actually constructing the metric. |
| W-1 | h(gamma) testable prediction | Effect ~ 10^-12 | Modification exists but is negligibly small in all planned experiments. |
| F-6 | r = 0.035 tensor-to-scalar ratio | Initially falsified, then restored | Used wrong phi_CMB parameter. Fixed with correct value. Still a live prediction. |

A note on F-6: this started as a falsification, but the error turned out to be in my analysis, not the prediction. The corrected calculation gives r = 7/200 = 0.035, which is still a live blind prediction testable by CMB-S4 around 2028. I include it here because the episode taught me something important: before declaring a prediction falsified, verify all your parameters. I almost threw away a valid result because of a careless substitution.

## What the Patterns Reveal

Looking at these 14 failures as a group, three patterns stand out:

**Pattern 1: Numerology is the default.** My very first attempts (F-1, F-2, D-1, D-2) were all simple numerology — taking division algebra numbers and dividing them until something matched. Every single one failed. The predictions that survived are the ones backed by actual mathematical arguments: Schur's lemma, Grassmannian geometry, standard GR integrals. There's a consistent correlation between "has a derivation" and "hasn't been falsified." That could mean the derivations are doing real work, or it could mean I'm better at constructing post-hoc justifications for numbers I've already checked. I can't fully distinguish these possibilities.

**Pattern 2: Order-of-magnitude proves nothing.** D-1 through D-4 are all cases where the framework got the right neighborhood but not the right answer. A 50% match on Newton's constant. Proportionality without the right coefficient. These feel encouraging when you find them, but the Monte Carlo test (where random integers match physics constants at 1% precision 80% of the time) shows they're statistically meaningless. The evidence, if any, lives entirely in the sub-ppm regime.

**Pattern 3: The biggest risk is compensating errors.** F-8 and F-9 are the scariest entries on this list, because they demonstrate that wrong x wrong can equal right. If I hadn't independently checked both factors, I would still be citing r_s = 337 x 3/7 as evidence. How many of my surviving predictions have similar hidden compensating errors? I've tried to check, but I can't prove the absence of a pattern I haven't noticed yet.

## What the Failures Don't Tell You

I want to be clear about what this document does NOT prove.

The fact that 14 predictions failed does not mean the surviving predictions are correct. Surviving a test is not the same as passing one. The surviving predictions haven't been proven right — they just haven't been proven wrong yet.

Similarly, documenting failures doesn't make me honest by default. It's possible to selectively document "safe" failures (ones you've already moved past) while quietly dropping others. I've tried not to do this, but I can't prove a negative. The full falsification record, with dates and session numbers, is public for anyone to audit.

And finally: the framework still has 4 irreducible assumptions that I haven't been able to derive from first principles. I originally claimed zero free parameters. That was wrong, and acknowledging it is probably the most important correction I've made. Down from 10, but not zero.

## What Failure Gets You

Here is the part that might not be obvious: these 14 failures are the primary reason I estimate a 25-40% probability instead of something lower or higher.

If the framework had never failed — if every prediction worked perfectly — I would be deeply suspicious. Perfect track records don't exist in science. They exist in numerology, where you can always find a formula that fits. The failures prove the framework is making real claims that can actually be wrong.

But if the framework failed at everything, the probability would be near zero. It doesn't. The blind CMB predictions work. The structural derivations — gauge groups, quantum mechanics, Einstein's equations — come from actual mathematical arguments, not pattern matching. The sub-ppm matches, while post-hoc, are hard to produce accidentally from a fixed set of integers.

The 14 failures sit between these extremes. They cut away the false positives, the lucky guesses, the compensating errors. What survives is smaller and more honest than what I started with.

And that's the point. The failures are why this isn't 5%, and why it isn't 80%. They're why I can look at what remains and say: maybe one chance in three.

## Where to Go From Here

If you want to see what survived these 14 failures, the [Prediction Explorer](/explore) has the full list — 37+ predictions, filterable by precision tier and domain. The ones that lived through this gauntlet are there, along with their derivation chains and verification scripts.

For the honest self-assessment behind the 25-40% probability estimate, see the [Honest Assessment](/publications/honest-assessment). For how I use AI without letting it hallucinate physics, see the [AI Methodology](/publications/ai-methodology).

The full falsification registry, with dates and session numbers for every failure documented here, is in the [public repository](https://github.com/perspective-cosmology/perspective-cosmology). Audit away.

---
