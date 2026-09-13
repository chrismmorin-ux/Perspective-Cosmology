# Perspective Cosmology — AI guidelines

Speculative mathematical framework. **Not established physics.** The prior
corpus is in `quarantine/` and is not citable; see `README.md` for why.

## The three rules that are not negotiable

1. **Report σ, never ppm alone.** A relative agreement figure without the
   experimental uncertainty beside it is how this project turned a 1,755σ
   refutation into a headline. If you quote ppm, quote σ in the same breath.

2. **Do not cite quarantine.** Promotion is a move plus a passing gate plus a
   commit — never a link. `gates/check_quarantine.py` enforces this.

3. **A claim of absence carries the search that established it**, including a
   positive control. "No such lemma exists" and "my grep was wrong" are the
   same output from an instrument nobody tested.

## Before proposing any numeric claim

Run `gates/` first. A formula is inadmissible — regardless of how it was
derived — if it is a continued-fraction convergent of the measured value, if it
equals the published rounding, if it does not beat the free approximation
bound, if chance alone would produce a hit that good, or if it sits >5σ from
measurement. All six prior headline claims fail at least one.

## Conventions

- Exact rational arithmetic. No floating point in anything load-bearing.
- Measured values come from the pinned register with their uncertainties. Code
  that derives may not read that register.
- Machine-checked beats argued. If it can be stated in Lean, state it there;
  `#print axioms` is the evidence, not the build succeeding.

## What this file is not

It is not a session protocol, a navigation index, or a substitute for reading
the gates. The previous version of this file was 132 lines and **9 of its 15
navigation targets did not exist**, including the one its own mandatory
start-up protocol told every session to read first. Orientation that rots
silently is worse than none, so this file stays short enough to stay true.

Everything mechanizable belongs in `gates/`, not here.
