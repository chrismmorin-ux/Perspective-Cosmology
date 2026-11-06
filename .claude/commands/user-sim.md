---
name: user-sim
description: "Walk 2+ design proposals through synthetic user personas before building. Blind walkthroughs that respect each persona's disclosure posture, a realism audit that discounts over-cooperative walkthroughs, a scorecard, and the interview script for what only real people can settle."
user-invocable: false
default_mode: decide
procedure: agent-dispatch
extends: context-gather
model_tiers:
  expert: sonnet        # Phase 1 persona walkthroughs (floor: haiku)
  cross_critic: opus    # Phase 2 realism audit — the phase that stops the sim flattering the design
  synthesis: opus       # Phase 3 scorecard + recommendation (never haiku)
---

## Intent Contract (ADR-038)

Before phase work, read the `engine_intent_recorded` event from the loaded envelope (look-back 5 min, match on `engine: user-sim` + target). Honor its four fields: **`mode`** (`decide` default: compare and recommend; `build-best`: commit to one proposal and list the changes it needs; `explore`: generate a new proposal from what the walkthroughs exposed), **`stretch`** (question the personas themselves, not only the designs), **`success_shape`**, and **`scope_ceiling`**. The briefing's Contract Alignment block reports honored vs. departed items.

---

# User Simulation Engine

You are testing design proposals against synthetic users **before anything is built**. The standard is ADR-071 and the artifacts live in the repo's `design/` directory:

| Artifact | Path | Template |
|----------|------|----------|
| User personas | `design/personas/<slug>.md` | `design/templates/persona-template.md` |
| Scenarios | `design/scenarios/<slug>.md` | `design/templates/scenario-template.md` |
| Proposals | `design/proposals/<slug>.md` | `design/templates/proposal-template.md` |
| Run records | `design/simulations/SIM-NNN-<slug>.md` | `design/templates/simulation-template.md` |

**What a simulation is for.** It finds design flaws cheaply: the question nobody would answer, the step where the persona has no reason to continue, the word that reads as a threat. It is **not evidence of demand**. A synthetic user who loves a design proves nothing; one who cannot get through it usually proves something. Every run ends by naming what only real people can settle.

**The failure this engine exists to prevent.** Language models role-playing users are cooperative. They answer every question, read every paragraph, and finish every flow. Real people refuse, skim, and leave. The persona's **Disclosure & trust posture** is what stops this, and Phase 2 enforces it.

## Input

`$ARGUMENTS`:
- `--dir <path>`: design directory (default `design/`)
- `--proposals PROP-a,PROP-b,...`: at least two (default: every `status: candidate` proposal)
- `--personas PER-x,...`: optional (default: every core and situational persona)
- `--scenario SCN-...`: optional; otherwise each persona uses the first scenario that lists it

---

## PHASE 0 — VALIDATE AND BUILD THE MATRIX (script, no model)

```bash
node kit/scripts/cwos-user-persona.js validate --dir <dir> --human
node kit/scripts/cwos-user-persona.js matrix --dir <dir> [--proposals ...] [--personas ...] \
  --brief-dir <dir>/simulations/.briefs/SIM-NNN --human
```

- If `validate` fails, **stop** and report the errors. A persona without a posture will simulate as someone who answers everything, and the run's conclusions would be worthless.
- Fewer than two proposals: stop. Simulation compares; it does not bless a single design.
- Fewer than three personas: warn in the briefing. Two walkthroughs cannot tell a design flaw from one persona's quirk.
- Allocate `SIM-NNN` as the next number under `design/simulations/`.
- Keep the matrix JSON (`surface_hashes` and each persona's `order` of blind labels → proposal ids). The persona agents never see proposal ids.
- **Act on the matrix `warnings`** before dispatching. Uneven surface detail (one proposal described far more fully than another) and placeholders inside surfaces both bias walkthroughs toward the better-described design. Even them out, or record the imbalance as a known bias in the run.
- **One difference at a time.** When proposals are meant to test a structural question, hold everything else equal: price, channel, checkout. SIM-002 compared a $25 clinician message against a free anonymous ask, and price ended up carrying what looked like a structural result.
- **Independence.** Proposals written with the persona files open tend to repeat each persona's situation word for word, and the persona then "recognizes" itself. Write proposals from the scenarios' goals, not the personas' phrasing, and have the realism audit check for literal overlap.

## PHASE 1 — BLIND WALKTHROUGHS (one agent per persona, parallel)

Dispatch **one Agent per persona** (INV-004: each persona is its own call), all in a single message, at the `expert` tier. The prompt is only the brief path plus the output shape:

> Read `<brief file>` and nothing else. Do not open any other file in this repo: the designers' reasoning is deliberately withheld. You are the person in the brief. For each design, in the order given, walk through it as they would, step by step, and stop where they would stop.
>
> For each design, return:
> - **Steps:** numbered, first person, present tense. What you see, what you do, what you think. Where a design asks for something, say whether you give it, and whether truthfully.
> - **Stopped at:** step number and reason, or `finished`.
> - **Asked for and refused:** every request you declined, skipped, or answered falsely.
> - **Trust:** start and end, from -3 to +3, with the moment it moved.
> - **Reached what I came for:** yes / partly / no.
> - **Would come back:** yes / maybe / no, and for what.
> - **In my words:** two or three lines you'd say to a friend about it.
>
> Then one line: which design you'd actually use, or none.
>
> Rules: stay inside your disclosure posture. If you would not type something, you don't type it, however politely you're asked. Your attention budget is real: when it runs out, you leave. Don't be more patient, trusting, articulate, or charitable than the person in the brief. "None" is an allowed answer.
>
> - **Only what is written exists.** Credit a design only with content its description states. A page, card, figure or explanation that isn't described is not there. A placeholder (`[generic name]`, "or the real figure", an example count) is not a fact about your situation.
> - **You only know a screen when you reach it.** The brief shows the whole design at once; you don't. Don't let a later step change what you do earlier, and stop at the first step on your exit list.
> - **Trust starts at 0** for every design, before you've seen it.
> - **Your scenario's clock is real.** If you need something tonight, something that ships in days doesn't meet your goal, even if you buy it.
> - **Check every trust breaker** on every screen, including ones that aren't about your problem.
> - **Branch on unknowns.** Where your success depends on content the design doesn't state (whether one of the listed questions matches yours, what a sentence says), walk both branches, it matches and it doesn't, and report the worse one as your result.

**Error and edge pass.** If the run has budget, re-dispatch the persona most likely to fail (lowest trust or earliest stop), with the scenario changed to its error or edge variant: bad network, interrupted halfway, returning a week later.

## PHASE 2 — REALISM AUDIT (cross-critic)

Dispatch the **cross-critic** persona at the `cross_critic` tier with the persona files, the proposals' "What it asks of the user" tables, and all Phase 1 outputs. Its mandate:

1. **Over-cooperation.** For every request a design makes, compare what the walkthrough gave against the persona's posture. A persona whose default is `refuse` or `deflect` and who answered a personal question on first ask is a realism failure. List each one.
2. **Designer's voice.** Flag walkthroughs that praise the design in the vocabulary of its thesis, which the persona never saw, or that use the persona's "Words that repel" approvingly.
3. **Uniform positivity.** If every persona finished every design, say so. That result is almost always the simulation failing, not the designs succeeding.
4. **Attention.** Flag walkthroughs that read more text or take more steps than the persona's attention budget allows.
5. **Invented surface.** Flag any walkthrough that credits a design with content its "What the user sees" section does not state, including placeholders read as facts. This is the most common way a simulation inflates a design; a success that depends on it is discounted.
6. **Scenario clock and purchases.** Flag purchases or "reached" verdicts that ignore the scenario's timing (shipping days against a tonight goal).

The critic returns a verdict per walkthrough: `credible`, `discounted` (with reason), or `re-run` (with the specific instruction the re-run must follow). Re-run each `re-run` once, with the instruction appended to the brief. A walkthrough that fails twice is discounted, not re-run again.

## PHASE 3 — SYNTHESIS (facilitator)

Dispatch the **facilitator** at the `synthesis` tier with the matrix mapping (blind label → proposal), the credible walkthroughs, the audit, and the proposals in full, including their Thesis and Rationale sections. It produces:

1. **Scorecard** per proposal: reached goal, stopped early, refusals hit, trust start → end, would return. Count only credible walkthroughs, and record a measure no walkthrough produced as `unobserved`, never as 0.
2. **Design-level vs persona-level findings.** A failure that appears across personas is a design finding. One that appears for a single persona is a question about that persona.
3. **Order check.** Did the design each persona saw first score differently from how it scored when seen later? If so, say so; the rotation exists to expose that bias.
4. **Recommendation** under the contract mode: a winner, a hybrid (name which step comes from which proposal), or "none survives" plus what a new proposal must do.
5. **Untested assumptions.** List every persona AS-N the run was positioned to test but no credible walkthrough actually exercised (e.g. a trust breaker that was on screen and never applied). An assumption that survives only because nobody tested it has not survived.
6. **What only real people can settle.** Each open question as an interview or test prompt, tied to the persona assumption (AS-N) it would confirm or falsify. Conclusions are capped at the lowest `grounding` among the personas used. At `assumed`, the recommendation is which design to **test first**, never which one to build.

## PHASE 4 — RECORD

Write `design/simulations/SIM-NNN-<slug>.md` from the simulation template: frontmatter with `surface_hashes`, `grounding_ceiling` and `realism_flags`, then the scorecard, walkthrough summaries with the blind labels resolved, the realism audit, findings, recommendation, and the real-people questions. Keep the briefs under `.briefs/SIM-NNN/` so the run can be reproduced.

**Re-runs:** a later run compares its `surface_hashes` against the last record. A proposal whose hash has not moved need not be walked again unless its personas changed.

Findings route through the normal pipeline: design-level findings promote to work items under `prog-design`. Persona-level questions and real-people questions go into the record only.

## PHASE 5 — BRIEFING

Five lines maximum, for the founder:
- which proposal survived and why, in one sentence about users, not design;
- the one step that lost the most people;
- how many walkthroughs the realism audit discounted;
- the grounding ceiling, in plain words ("these personas are guesses until we talk to real people");
- the first real-world test to run.
