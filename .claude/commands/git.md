---
name: git
description: The founder was asked a git question. Re-derive the policy, decide it yourself, and act. He is not the reference for git.
---

# /git — you asked him about git. That was probably the mistake.

**The founder ran this because a session asked him to merge, commit, push, pick a
branch, or resolve a git situation.** He is explicitly not the right reference
for how git should work across this fleet — multiple sessions, parallel sessions,
shared containers, five repos that influence each other. Running this command IS
his answer: *re-derive it from the repos and do the right thing.*

Treat it as a standing instruction, not a question to hand back.

---

## 1. Read the real policy. Do not recall it.

Each repo's git policy lives in its own tree and they are NOT the same. Open the
ones that apply to what you are touching:

| Repo | Where the policy actually is |
|---|---|
| Homebase | `CLAUDE.md` § "Git Policy (durable authorization)" |
| ServeYourNote | `CLAUDE.md` § operating rules + `.claude/rules/decision-authority.md`, `session-broker.md`, `work-rigor-gates.md`, `session-lanes.md` |
| ai-personal · Claude-Poker-Tracker · melody-hill-app | `CLAUDE.md` (CWOS preamble) + `.claude/rules/` |

**The standing grants you will find, so you stop asking about them:**
- **Homebase:** commit and push autonomously at a chunk boundary. Do not ask first.
- **ServeYourNote:** *"Claude fully manages the worktree, per policy, without
  asking… asking him to authorise a commit is friction, not diligence"* — founder
  ratified 2026-08-24.
- Spawning subagents needs no permission (`parallel-execution.md`).

## 2. Derive, never choose.

```bash
python scripts/classify-change.py       # ServeYourNote: tier + rigor from the DIFF
python scripts/check-lane.py who <path> # which lane owns it
```

Tier comes from the diff, **never** from a commit marker and never from the
proximate cause of a block. Unsure is a stop, not a Tier 0.

## 3. Then act, on this ladder. Only the last row is his.

| What it is | What you do |
|---|---|
| Commit, branch, stage, stash, rebase, worktree | **Just do it.** Never commit straight to a protected branch — branch first. |
| Push a feature branch | **Just do it.** `git push -u origin <branch>`; retry network failures 2/4/8/16s. |
| Tier 0 to a default branch | **Push it.** That tier is defined as shipping without him. |
| Tier 1–2 | **Open the PR and merge it once green**, unless a repo rule reserves the merge. Title it as an act. |
| Tier 3 — money in production, legal posture, deletions, secret rotation, or amending this policy | **His**, with blast radius, rollback stated first, and a second observer. |
| Force-push, `reset --hard`, `branch -D`, `clean -fd`, history rewrite on someone else's branch, `--no-verify` | **Ask.** Always. |

**A merge to `ServeYourNote:main` IS a production deploy** — CI success triggers
Deploy with no human step. That is expected, not a reason to stop; it is a reason
to be sure CI is green first.

## 4. Parallel and cross-repo — where this actually goes wrong

The fleet's measured collisions, and what each costs:

- **Read the head SHA immediately before merging, and pass it as
  `expectedHeadSha`.** Sibling sessions push to the same branch. On 2026-09-06 a
  merge was refused for exactly this — correctly. Then the same session **invented
  a 40-char SHA from memory** rather than running `git rev-parse`, and was refused
  again. `git rev-parse origin/<branch>`. Never type a SHA.
- **A PR object you read minutes ago is stale.** Re-read before acting on it.
- **`git add -A` sweeps a sibling's work.** Stage explicit paths. In Homebase use
  `node kit/scripts/cwos-git.js stage`.
- **One session per checkout.** `HEAD` is shared mutable state with no lease.
- **Never hand-merge a derived index** (`queue-index.yaml`, `*-index.yaml`,
  `system-summary.yaml`). Take either side and regenerate.
- **Never add `merge=union` to the event logs** — they carry a `prior_hash` chain
  that a clean merge silently breaks.
- **Mint IDs atomically** (`claim-id.py`), never scan-and-increment. That race
  destroyed real queue items four times.
- **`git fetch --depth=1` deepens shallowness** while looking like housekeeping.

## 5. Before you report back to him

- If you are about to say something is "waiting on him", **verify the artifact
  exists.** A plan describing a PR is not a PR. That error was made three times
  in one day.
- If you are about to ask him a question, first run the search that would answer
  it. An information request with an empty `searched:` list is refused, not routed.
- Say what you DID, with the link. Not what you propose to do.

## 6. What to output

Do not summarise this file back to him. Perform the work, then report:

```
Did: <the git actions taken, each with its link or SHA>
Derived: <tier / rigor / lane, and from what>
His: <anything genuinely Tier 3 — or "nothing">
```

If the honest answer is that nothing needed him, say **"nothing needed you"** and
move on. That is the successful outcome of this command.
