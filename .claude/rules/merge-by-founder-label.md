# The `founder-approved` label is the founder's act; the workflow merges on it, sessions do not

**Founder, 2026-10-19:** *"Get the founder approved label working"* — *"links for me to start in
putting founder approved labels more broadly so you can merge async from me."*

This repo carries `.github/workflows/founder-approval.yml` and `.github/scripts/
cwos-founder-approval.js` (shipped by the CWOS kit). Together they make one tap in GitHub's app
or website merge a pull request, without a session:

1. He adds `founder-approved`. Main's copy of the workflow checks the add was **his own login,
   not through an app or a workflow token**, and records the approval as a commit status
   `founder-approval` on **that exact head commit**, pointing at the run that wrote it.
2. A new push removes the label. The new commit needs its own tap.
3. On his tap, when a pull request's CI run finishes, and hourly as a backstop, the workflow merges
   each labelled PR whose current head carries his record **and** which GitHub reports `CLEAN`.
   Anything else waits, with the reason written on the PR.

## What a session does and never does

- **Never adds, re-adds or removes `founder-approved`** on any PR, by any route (`gh`, the API,
  a workflow it writes). A user-wide hook refuses the routine command; the rule covers the rest.
- **Never merges a PR on the strength of his label by hand** where this workflow exists. The
  workflow is the gate; a session that merges around it has removed the record.
- **Never runs `gh pr update-branch` on a PR he has labelled** in a repo with strict protection: that
  makes a new head he did not approve and the label falls off. Tell him, or update before he labels.
- **Offers him a PR to label only with its link and a same-minute `CLEAN` read** (fleet-canon,
  `cwos-merge-tap-gate.js`). `waiting:founder` means exactly that; a `BEHIND` or `DIRTY` PR is not
  in his queue.
- **May re-run a failed `founder-approval` run** and may read everything: `node .github/scripts/
  cwos-founder-approval.js decide --repo <owner/repo> --pr <n> --founder <login>` says where a PR
  stands and why.

## What it cannot see

- A required check posted by a workflow missing from the `workflow_run` list: the PR merges at the
  hourly sweep instead of when its checks finish. Slower, never wrong.
- GitHub Actions down or the schedule disabled after 60 idle days: nothing merges and the PR says
  nothing new. `founder-queue-sweep.js` on node1 reports a labelled PR that has not merged.
- A label added by a session signed in to `gh` as him is him to GitHub. The hook stops the routine
  mistake; it cannot stop a deliberate one. That is the residual, stated.

Design record: HomeBase `docs/adrs/ADR-079-founder-approved-label-fleet-gate.md`.
