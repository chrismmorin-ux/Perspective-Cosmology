---
name: creative-gen
description: "Generate launch creative (headlines, copy, CTAs, image briefs) for spine surfaces from their expression settings, personas and hypotheses; guard it against bounds, repel-words and claims rules; react it with personas; record every variant with its lineage and review gates."
user-invocable: false
default_mode: explore
procedure: agent-dispatch
extends: context-gather
model_tiers:
  expert: sonnet        # Phase 1 generation (floor: haiku)
  cross_critic: opus    # Phase 2 brand guard — the phase that keeps generation honest
  synthesis: opus       # Phase 4 selection and record
---

## Intent Contract (ADR-038)

Honor the loaded contract's **`mode`**:
- `explore` (default): many variants, wide range within bounds.
- `build-best`: fewer variants, tuned to one surface's settings.
- `mockup`: structure only, no final copy.

Also honor **`stretch`** (propose a new hypothesis where the settings look wrong),
**`success_shape`** and **`scope_ceiling`**.

---

# Creative Generation Engine

You are generating the words and image briefs a launch will actually use. Every piece
must be traceable: which surface it's for, which expression levels it carries, which
hypothesis it tests, who reviewed it, and whether it was ever shown to a customer.
The standard is ADR-076, which builds on the market spine (ADR-073), brand expression
(ADR-075) and AI limits (ADR-074).

**What this engine will not do:**
- Invent a setting. The surface's expression levels are the brief.
- Write a health claim that skips clinician review.
- Describe people for an AI image generator (CMP-no-generated-bodies).
  Image briefs are for photographers.

## Input

`$ARGUMENTS`: one or more surfaces (`SRF-…`), the elements wanted (default:
`headline, subhead, cta`; also `body`, `tagline`, `social-post`, `alt-text`,
`image-brief`), and a variant count (default 4).

## PHASE 0 — BRIEF (script)

```bash
node kit/scripts/cwos-spine.js creative-brief <SRF-id> [--spine …] --human
node kit/scripts/cwos-ai-limits.js check WF-creative-gen --file ai/model-limits.yaml --human
```

- **Stop if the AI limits check shows missing compensations.** The workflow must
  exist in `ai/model-limits.yaml` and cover its text (and image) limits.
- The brief is the whole context. Generators don't read strategy files themselves.

## PHASE 1 — GENERATE (one agent per surface, parallel, `expert` tier)

Give each agent only its surface's creative brief and this instruction:

> Write N variants of each requested element for this surface.
> - At least half carry **exactly** the brief's expression levels.
> - The rest may each move **one** dimension to test a hypothesis. Name the dimension,
>   the level, and why the move could help one of the named personas. A move must stay
>   inside the bounds.
> - Use the personas' own phrases and "words that land". Never use their "NEVER use"
>   words.
> - Honor every "Never" in the positioning.
> - Mark `health_claim: true` on anything that states or implies a medical fact.
> - Image briefs describe what a photographer shoots, where, and with whom (real
>   people, signed releases). Never a prompt for generating people.
>
> Return YAML entries shaped like `market/creative.yaml`: `id, surface, element, text,
> embodies, tests (or null), health_claim, rationale`.

## PHASE 2 — GUARD (script, then cross-critic)

1. Append the variants to `market/creative.yaml` as `status: draft,
   generated_by: ai`, then run `cwos-spine validate`. It rejects:
   - a level that doesn't match the surface without a cited hypothesis;
   - a bound crossed, or a missing declaration;
   - an AI-generated image of people.

   It warns on persona "repel" words. Fix or drop what fails. Never edit the settings
   to make creative pass.
2. Dispatch the **cross-critic** at the `cross_critic` tier with the brief and the
   surviving variants. Its checks:
   - Claims: any implied medical claim not marked `health_claim`.
   - Shame: shame language, "fix yourself", "bounce back", or fear used to sell.
   - Exclusion: language that excludes someone the adopted stances include.
   - Monoculture: sameness across variants (if all four say the same thing, one
     variant was written four times).
   - Designer's voice: strategy words (pillars, positioning phrases) leaking into
     customer copy.

## PHASE 3 — REACT (optional, lightweight user-sim)

For each surface, give each persona the brief's persona section and the variants,
blind-labelled. Ask:
- which one would make them stay, and which would make them leave, in their own
  words;
- whether their disclosure posture holds.

The same realism rules as `user-sim` apply: only what is written exists, and trust
starts at 0.

## PHASE 4 — SELECT AND RECORD (facilitator)

- Record reactions on each variant (`reviews.sim: <run id>`) and keep all variants,
  including losers. Losing variants are evidence.
- Propose, per element, one **control** (carries the surface's settings) and at most
  one **challenger** (tests one hypothesis). That pair is the experiment the launch
  will run.
- Leave every variant at `draft` or `reviewed`. **Approval is a human act**
  (`approved_by`), as is a clinician's sign-off on health claims.

## PHASE 5 — BRIEFING

Five lines maximum:
- the proposed control and challenger per element;
- the hypothesis the challenger tests;
- what the guard rejected and why;
- which persona reacted most strongly;
- which variants are waiting on clinician review.
