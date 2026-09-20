# AGENTS.md

> Vendor-neutral instructions for any AI coding agent working in this repo.
> This file follows the open [AGENTS.md](https://agents.md) convention: plain
> Markdown, H2 sections, no required heading set.
>
> **Deliberately thin.** The full working protocol for this repo lives in
> `CLAUDE.md`. This file carries only what survives a change of harness: what
> the repo is, how to build and test it, how it is laid out, and how to write
> code that matches what is already here. If you find yourself copying a
> paragraph out of `CLAUDE.md` into this file, stop — that is the drift this
> file is shaped to avoid.

## What this repo is

<!-- One or two sentences. What it does, and for whom. -->

## Commands

Every command below is the repo's own declared check, kept in sync with the
Vital Signs table in `system/state.md` — that table is the single source of
truth, and this block is generated from it.

Regenerate after changing a vital sign:

```bash
node kit/scripts/cwos-agents-md.js sync
```

<!-- cwos:commands:start — generated from system/state.md Vital Signs. Hand edits are overwritten by `cwos-agents-md.js sync` and fail `cwos-agents-md.js check`. -->
| Area | Command |
|------|---------|
<!-- cwos:commands:end -->

## Project structure

<!-- The three or four directories an agent actually needs to find. Not a tree. -->

| Path | What lives here |
|------|-----------------|
|      |                 |

## Code style

<!-- Only the rules that are not already obvious from reading the code:
     naming, error handling, what to never import, test file placement. -->

## Working agreements

- Match the surrounding code — its naming, its comment density, its idioms.
- Run the commands above before declaring work done.
- Do not commit generated files, secrets, or `.env`.

## Repo-specific protocol

This repo runs CWOS (a session protocol: sprints, work queue, invariants,
recorded decisions). If your harness reads `CLAUDE.md`, read it — it is
authoritative and this file is the portable subset. If it does not, everything
above still holds on its own.
