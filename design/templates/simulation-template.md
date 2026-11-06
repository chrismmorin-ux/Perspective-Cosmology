---
# ─── Simulation run record (ADR-071) ────────────────────────────────────────
# Written by the user-sim engine. One file per run. Simulations are evidence of
# DESIGN FLAWS, never evidence of demand: a synthetic user who loves a design
# proves nothing; a synthetic user who cannot get through it usually proves
# something. Conclusions are capped at the grounding tier of the personas used.
id: SIM-NNN
date: YYYY-MM-DD
proposals: [PROP-<slug>]
personas: [PER-<slug>]
scenarios: [SCN-<slug>]
surface_hashes: {}             # from `cwos-user-persona matrix` — re-walk only proposals whose hash moved
grounding_ceiling: assumed     # lowest grounding among the personas used
realism_flags: 0               # walkthroughs the realism audit discounted
---

# SIM-NNN — <what was compared>

## Question

What decision this run informs.

## Scorecard

| Proposal | Reached goal | Stopped early | Refusals hit | Trust (start → end) | Would return |
|----------|-------------|---------------|--------------|---------------------|--------------|

Record a measure the walkthrough did not produce as `unobserved`, never as 0 or "no".

## Walkthroughs

One subsection per persona × proposal: the steps, where they stopped and why, what
they were asked that their posture refuses, and two or three lines in their voice.

## Realism audit

Walkthroughs where the simulated persona behaved more cooperatively than their
disclosure posture allows, or spoke in the designer's voice. These are discounted
in the scorecard and listed here.

## Findings

What held across personas (design-level) vs. what one persona alone raised
(persona-level). A design-level failure is a finding; a persona-level one is a question.

## Recommendation

Which proposal, which hybrid, or which change, and why.

## What only real people can settle

The questions this simulation could not answer, phrased as an interview or test
script, each tied to the assumption (AS-N) it would confirm or falsify. A
simulation that leaves this section empty overstated itself.
