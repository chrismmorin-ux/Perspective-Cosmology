# A session's final words are its handoff

**Founder, 2026-11-03:** *"our final words could be the handoff … the session running it can view
these kinds of things as 'here it is ready to handoff, recommend starting a new session with:'"*

Measured first: across 150 session endings, nearly every one named the founder's next step, and
**1 of 150** left a prompt a new session could start from. Half of the final messages were a reply
to the "work is still loose" git hook, so the real reason for stopping was buried one message up.
The founder rotates sessions himself (`/clear`). A handoff is what makes that rotation lossless.

## When

Whenever you stop working and anything is left, for any reason: finished a piece and the next one
is queued, waiting on him, waiting on CI or another machine, blocked, or short on memory.
A pure question-and-answer turn needs no block.

## The block

The last thing in your reply. A fenced block with the language `handoff`:

````
```handoff
reason: decision
done: cockpit board built and pushed; PR #161 open
left: relay design (WS-1350)
git: all committed and pushed on claude/session-handoff
needs: desk item homebase-approve-homebase-pr-161 (https://github.com/owner/repo/pull/161)
Ready to hand off. Start a new session with:
> In HomeBase: once PR #161 has merged, build cockpit phase 2 (WS-1349) from docs/designs/session-cockpit.md.
```
````

- **reason**: exactly one of the six below.
- **done / left**: one line each. `left: nothing` when nothing is.
- **git**: what is committed, pushed, and anything you leave loose and whose it is.
- **The start prompt** goes after `Start a new session with:`. It must stand on its own: name the
  repo, the item and the next step. A new session cannot see this conversation, so never write
  "as above" or "as discussed".

## Ready means (by reason)

| reason | ready when |
|---|---|
| `done` | everything committed and pushed; `left:` names the next item, or says nothing |
| `needs-you` | his action is on his desk or his PR list; `needs:` carries the link |
| `decision` | the question is on his desk with your recommendation; `needs:` carries the link or desk id |
| `waiting` | `check:` says what is running, where, and when to look again |
| `blocked` | `blocked-by:` says what holds it and who can clear it |
| `low-memory` | unfinished work is in a WIP commit, so nothing exists only on this disk |

## What checks it

The `session-report-log` Stop hook reads the block every turn, measures git and context itself,
and keeps the result in the session's report (`.claude/workstream/reports/`). It never trusts the
block's own account of git. A turn without a block keeps the last one, so a session cut off by a
usage limit still leaves its most recent handoff. The cockpit (`kit/scripts/cwos-cockpit.js`)
shows ready handoffs with their start prompt, and `cwos-cockpit handoffs` measures how many stops
carried one: target 80%.

When `clean-tree-check` stops you for loose work, land it, then make the handoff block your
closing message. Do not write a separate git summary.

Design: HomeBase `docs/designs/session-handoff.md`.
