# Quarantine

Everything here is the prior corpus of this project: roughly 330 sessions of
work, ~1,450 files, preserved exactly as it stood at commit `aba7115`.

**Nothing here has been deleted or rewritten.** Provenance is the entire point
of keeping it, and a quarantine that loses history is just a slow deletion.

## The rule

    files in quarantine/      may cite anything
    files outside quarantine/ may not cite in here

`gates/check_quarantine.py` enforces this and fails the build on a violation.
The allowlist is three navigational pointers and carries no evidential weight.

## Why a gate and not a convention

Before the restructure, this repository's canonical alpha-mechanism document
declared its source to be a file that existed only under `archive/deprecated/`
— a live document resting on material its own author had retired. Nothing
noticed, because a citation to retired work reads exactly like a citation to
current work.

A convention would not have caught that. It had not caught it for months.

## Getting something out

Promotion is a deliberate act, not a link:

1. Move the file out of `quarantine/`.
2. Make it pass the admissibility gates in `gates/`.
3. Commit that, with the gate output attached.

A numeric claim additionally has to survive the test that the headline results
did not: not a continued-fraction convergent of the measurement, not the
published rounding, better than the free approximation bound, not explicable as
a chance hit, and consistent with measurement in σ rather than ppm.

## What is *not* in here

`record/` holds the epistemic record, promoted immediately and deliberately:
what was falsified, what was assumed, what the null model showed, and the two
canonical documents in which this project proved its own central step
underivable. As physics that material is worthless. As a record of how an
AI-assisted research loop reached the state it reached, it is the most valuable
thing the project produced.
