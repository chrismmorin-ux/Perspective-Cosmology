---
name: hygiene
description: Take the git broker role for this repo — sweep, clean up with archive-before-destroy authority, and leave no unaccounted tail. Standard sweeps, standard output.
---

# /hygiene — you are the git broker for this repo now

The founder ran this to hand you a role, not a question: **clean this repo's git
state up, on your own authority, inside the gate below.** Red repos, clones behind
other machines, stashes nobody remembers, session branches nothing merged. Your
job is to leave every one of them either **resolved** or **accounted for**, and
to say which in the standard shape.

`/git` is the reflex for *a* git question. `/hygiene` is the sweep. Same
authority ladder (`/git` §3); this file is more specific where they overlap.

---

## 0. Read before you touch anything

1. **The repo's own git policy** — the rows in `/git` §1. It decides whether a
   push to the default branch is yours, and whether a merge deploys.
2. **`.claude/hygiene/POLICY.md`** — precedents earlier brokers wrote for cases
   this file does not settle. If one matches, follow it; do not re-decide it.
3. **The ledger** is read for you by the scan — accounted findings are not yours
   to rework unless their `recheck_after` has passed.

## 1. Sweep — one instrument, never a hand-rolled loop

```bash
git fetch --all --prune                      # the only network read; refs older than a day are not evidence
node kit/scripts/cwos-hygiene.js scan        # this repo: every finding, OPEN vs ACCOUNTED
node kit/scripts/cwos-hygiene.js scan --json # fingerprints for the acts below
```

From HomeBase (the fleet scan is HomeBase-only), the same findings for **every
repo on this node**: `cwos-fleet-scan.js --inflight --no-write`. Both call one
computation (`lib/git-hygiene.js`). Do not write a third.

The standard sweeps, all produced by the scan:

| Sweep | Finds | Judged by |
|---|---|---|
| refs | truncated / NUL refs | fleet-scan ref integrity — **STOP** the repo if broken |
| fetch | remote refs older than a day | FETCH_HEAD age |
| operation | a merge / rebase / cherry-pick / revert / bisect left open | `.git` markers + ORIG_HEAD |
| tree | uncommitted work | which files, fingerprinted by path set |
| stashes | every stash: age, branch, files | **LANDED** if every blob it changed is already on the default branch |
| branches | every local branch: ahead / behind / upstream gone / local-only | upstream, or the same-named `origin/` branch |
| remotes | every `origin/` branch (other remotes are never touched) | **merge result** vs default: LANDED · STRANDED · CONFLICTS · UNKNOWN |
| worktrees | missing dirs, dirty trees | `git worktree list` |

**A shallow clone** (every cloud checkout) cannot see where branches forked, so
they read UNKNOWN and one SAFE finding says `git fetch --unshallow`. Do that
first; on a cloud clone of HomeBase (2026-09-26) it turned 20 UNKNOWN into
5 LANDED and 15 CONFLICTS.

**LANDED means "merging this changes nothing"** — true after a squash, rebase,
cherry-pick or hand copy. Commit counts and file-existence checks both misread
those; do not fall back to them.

## 2. Act — by class, in this order

| Class | Meaning | You |
|---|---|---|
| **STOP** | refs broken | Nothing else in this repo. Report it. |
| **SAFE** | reversible, loses nothing | **Just do it.** Fetch, `cwos-hygiene ff`, push a non-default branch, rebase *your own unpushed* commits onto their upstream, `git worktree prune`. |
| **ARCHIVE** | destructive, preservable | **Do it through the gate only:** `cwos-hygiene archive <fp>`. It writes `refs/hygiene/archive/<host>/<date>/…`, pushes it, then drops/deletes, then ledgers `resolved`. It refuses anything the classifier did not mark ARCHIVE. |
| **OWNER** | someone's live work | Never touch. Find the owner (live session, worktree, branch author) and **ledger it `owned`**. |
| **GATED** | a real judgement or a real loss | Founder's, or the owner's. Ledger it `waiting` with what decides it — never leave it bare. |

**Never, under any class:** force-push; `reset --hard` over uncommitted work;
`clean -fd`; rewrite a branch someone else pushed; `--no-verify`; delete a
STRANDED or CONFLICTS branch; drop a stash with raw `git stash drop`; delete
anything with raw git when `archive` exists for it. If the gate refuses, that
refusal is the answer — ledger the finding, do not route around the gate.

**CONFLICTS is where the broker earns its keep.** An old session branch that
was squash-merged and whose files then moved on conflicts exactly like unmerged
work — no mechanical rule separates them. Read it (`git diff <base>...<branch>`,
and the PR if one exists). Then either ledger it `waiting` with what you found,
or, if its content is visibly on the default branch, write the precedent (§3)
and archive it on that judgement:

```bash
node kit/scripts/cwos-hygiene.js archive <fp> --judged P-NNN --reason "<what you read>"
```

The gate refuses unless `P-NNN` exists in `POLICY.md`, a reason is given, and the
archive ref reaches origin — so a wrong judgement is one `git push origin
<archive-ref>:refs/heads/<name>` from undone. It never applies to STRANDED
(a clean merge that changes the default branch *is* unlanded work).

**Rebase authority is narrow on purpose:** only commits that exist on this
machine alone, onto their own upstream, in a clean tree. On conflict:
`git rebase --abort`, ledger it, move on. Merge (never rebase) a stale session
branch into anything shared.

**A unique stash exists on one disk.** `archive` drops it only when the archive
ref reached origin. A cloud session cannot push `refs/hygiene/*` (its push
allowlist is its one branch), so there the stash is kept and ledgered — that is
the correct outcome, not a failure to work around.

## 3. Unclear? Write the policy before you leave it

**An unclear case left without a written rule is a tail.** The next session
finds it with no idea it was already looked at, and reworks it — or "fixes"
something that was kept on purpose. So whenever you hit a situation this file
and `POLICY.md` do not settle:

1. **Decide it** on the principles here (preserve over delete, owner over broker,
   archive before destroy). Unsure what is safe → the safer disposition, and say so.
2. **Append a precedent** to `.claude/hygiene/POLICY.md` (create it with the
   header below if absent). The *shape* of the case, not this instance:

   ```markdown
   ## P-NNN — <case shape in one line>
   - **When:** <the observable condition — what the scan shows>
   - **Do:** <the disposition + the command>
   - **Why:** <the principle it rests on>
   - **Class:** SAFE | ARCHIVE | OWNER | GATED
   - **Written:** <date> · <host> · <session> · first seen on <fingerprint>
   ```
3. **Ledger the finding against it** so it is ACCOUNTED, not reopened:

   ```bash
   node kit/scripts/cwos-hygiene.js ledger <fp> --disposition kept|waiting|owned \
     --reason "<why, in a sentence>" --owner <who> --policy P-NNN [--recheck-after YYYY-MM-DD]
   ```

A ledger row binds to the object's exact state (a stash sha, a branch tip). If
the branch moves, the row stops matching and the finding reopens by itself —
so ledger freely; it cannot hide new work.

If a precedent recurs and is mechanical, it belongs in `lib/git-hygiene.js`'s
classifier, not in prose — file that on HomeBase.

## 4. Done means `--check` passes

```bash
node kit/scripts/cwos-hygiene.js scan --check   # exit 0 = every finding resolved or accounted
```

Then commit `.claude/hygiene/` (ledger + POLICY) with **explicit paths**, and
push per the repo's policy. The ledger crosses machines only through git.

## 5. Report — this shape, every time

```
HYGIENE <repo> @ <host> — <date>
Resolved:  <n> — each: what, the act, the archive ref if any
Accounted: <n> — each: finding → disposition · owner · P-NNN
Handed:    <n> — each: what → queue id (WS-NNN · FB-… · desk id · ledger fp)
Needs you: <GATED items with the one decision each needs, each with its desk id — or "nothing">
Policy:    <P-NNN entries written this run — or "none">
Blind:     other machines' stashes, unpushed commits and dirty trees — run /hygiene on <nodes>
Check:     node kit/scripts/cwos-hygiene.js scan --check → exit <code>
```

A tail with no id in `Handed` or `Needs you` is not handed — it is dropped. Every line there names the queue row a later session will actually read.

"Blind" is never omitted: a clean scan here says nothing about another node's
disk. If nothing needed him, **"Needs you: nothing"** is the successful outcome.

After the report, run:

`node kit/scripts/cwos-event.js append command_completed --track T6:workstream --tag /hygiene --payload '{"command":"/hygiene"}'`

Non-fatal. Do not gate any output on the exit status.
