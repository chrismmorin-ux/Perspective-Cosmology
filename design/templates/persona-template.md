---
# ─── User persona (ADR-071) ─────────────────────────────────────────────────
# A synthetic END USER of the product. Not a reviewer persona: those live in
# personas/ and .claude/agents/ and evaluate code. This file describes a person
# the product serves, so a design can be walked through as that person.
#
# Validate: node kit/scripts/cwos-user-persona.js validate
id: PER-<slug>                 # stable id; file name is <slug>.md
name: "<first name>"           # a human name, for readability only
kind: core                     # core | situational | variant
extends: null                  # situational/variant: the PER- id it layers on
synthetic: true                # ALWAYS true. Real customers never live in personas/.
grounding: assumed             # assumed | secondary-research | interviewed | observed
evidence: []                   # sources for grounding above `assumed` (paths, links, interview ids)
prevalence: null               # optional: rough share of users this persona stands for (e.g. 0.3)
last_reviewed: YYYY-MM-DD
---

# <Name> — <one-line archetype, e.g. "night-shift nurse, recurring problem, hates asking">

## Snapshot

Two to four sentences: life stage, circumstances, what their week looks like. Concrete
enough that two people reading it would picture the same person.

## What they are trying to get done

The jobs they hire the product for, in priority order. Each one names what "done"
looks like **to them** — not to the business.

1. ...

## What brings them in

The trigger moments: the specific situation, time of day, and emotional state in
which they first reach for the product. A trigger is an event, not a demographic.

## Disclosure & trust posture

**Required.** This is the section simulations depend on. Synthetic users are
cooperative by default: they answer every question and finish every flow. Real
people do neither. This section says what this person will and will not do, so a
simulated walkthrough can refuse where they would refuse.

- **Default answer to a personal question:** refuse | deflect | minimal | answers
- **Shares freely:** what they'll say without hesitation
- **Shares only after trust is earned:** what, and what earns it
- **Never shares (in this channel):** what they will not type, say, or tick in a box,
  however it's asked
- **Trust builders:** signals that make them lean in
- **Trust breakers:** signals that make them leave. One is usually enough.
- **Preferred channel:** anonymous/signed-in, text/voice, human/AI, in-person/online

## Constraints

- **Attention budget:** how long before they give up (seconds, taps, minutes)
- **Privacy of their surroundings:** shared phone, partner or kids nearby, work computer
- **Money:** what they'll spend, and what feels like a rip-off
- **Device & access:** device, connectivity, literacy, accessibility needs

## Exits

The moments they abandon, specifically. "Gets bored" is not an exit. "Sees a form
asking for a date of birth before they know what this is" is.

## In their words

Three to five phrases they would actually use, in their vocabulary, not the product's.
A simulation must speak in this voice. If these sound like marketing copy, rewrite them.

- **Words that land:** terms that make them feel understood
- **Words that repel:** terms that read as clinical, judgmental, salesy, or a threat

## What would make this persona wrong

The assumptions this persona rests on, and what real-world evidence would falsify
each one. Tag each with where it came from: `observed`, `asked`, `inferred`, or
`assumed`. Every persona is a hypothesis until `grounding` reaches `interviewed`.

- **AS-1** (assumed): <assumption>. Falsified if: <observable>.

---

<!--
SITUATIONAL and VARIANT personas (kind: situational | variant, extends: PER-...)
hold DELTAS ONLY. Keep the frontmatter; replace the body with:

  ## Trigger and exit      — what starts this situation and what ends it
  ## What changes          — only what differs from the base persona
  ## A surface must offer  — what any design must give them in this moment
  ## A surface must not    — what any design must never do to them in this moment

A layered persona inherits the base persona's Disclosure & trust posture unless it
declares its own. Situational = the same person in a different moment (2am, in a
hurry, partner in the room). Variant = a sub-population of the base (first-timer,
distressed, expert).

NOT A USER PERSONA: the founder, the operator, or a named real person. Model real
people as real records elsewhere (e.g. a customers/ store) with observed dates;
keep this directory synthetic.
-->
