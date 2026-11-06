---
# ─── Design proposal (ADR-071) ──────────────────────────────────────────────
# One candidate design, written as the SURFACE a user meets. A simulation hands
# only the "What the user sees" section to the persona agent, never the rationale, so
# the persona reacts to the design rather than to the designer's argument for it.
id: PROP-<slug>
status: candidate              # candidate | selected | rejected | merged
last_reviewed: YYYY-MM-DD
---

# <Proposal name>

## Thesis

One paragraph: the bet this design makes about users. **Not shown to persona agents.**

## What the user sees

**Shown to persona agents verbatim.** The step-by-step surface: every screen, prompt,
question, shelf, or conversation turn, in the order the user meets it, with the exact
copy wherever wording matters. Describe what is on screen, not why it is there.

1. **Entry:** ...
2. ...

## What it asks of the user

Every piece of information the design requests, when it asks, and whether it is
optional. The simulation checks each one against the persona's disclosure posture.

| Step | Asks for | Required? |
|------|----------|-----------|

## Rationale and risks

Why this might win, and the failure mode it is most exposed to. **Not shown to
persona agents.**
