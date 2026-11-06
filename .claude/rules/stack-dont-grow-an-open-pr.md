# New item work goes on a stacked branch, never onto an open PR

**Founder, 2026-11-04:** *"Your recommendation. This might be a best practice needing to be
captured in git and your processes."* This was about Claude-Poker-Tracker PR #160 (GOAL-002). It
already carried three finished items (WS-1894, WS-1897, WS-1899). The next item, WS-1895, is
effort L, and it was about to be added to the same PR.

## Why

- **A push removes his approval.** Every new commit on a labelled PR drops `founder-approved`
  (`merge-by-founder-label.md`). Growing a PR restarts his review on a bigger diff.
- **Finished work is held back.** A goal criterion counts only when its item's completion commit
  is on the default branch. On #160, three criteria were done but stayed red until #160 merged.
  Folding WS-1895 in would have held them back for the length of an L item.
- **Every push pays the gates again.** In Poker Tracker that is about 10 minutes of pre-push
  gates under the machine-wide heavy lock.

## The rule

1. **An open PR takes only what its own review needs:** review fixes, CI repair, and an update
   from the default branch. New item work does not go on it.
2. **New item work starts a branch from the open PR's head**, in its own worktree:
   `git worktree add -b <new-branch> <path> <parent-head-sha>`.
3. **Push it and open its PR as a draft, based on the parent branch.** Two reasons:
   - The diff shows only the new work.
   - A draft stays out of his queue, because `waiting:founder` means ready to merge.

   CI may not run on a PR whose base is not the default branch. That is acceptable while it is
   a draft.
4. **When the parent merges, retarget the PR and rebase the branch.**
   - **Retarget.** With delete-branch-on-merge, GitHub moves the PR's base to the default branch
     by itself. Otherwise run `gh pr edit <n> --base <default>`.
   - **Rebase onto the default branch.** `cwos-founder-approval.js` merges with a merge commit,
     so the parent's commits are already on the default branch and drop out of the rebase. If
     the parent was squashed, use `git rebase --onto origin/<default> <parent-head-sha>` instead.
   - **Then mark it ready,** and give him a same-minute `CLEAN` read.
5. **One level deep.** If a third branch would stack on the second, ask him to merge the first.

The fleet's open-PR standard (HomeBase `.claude/rules/pr-backlog-standard.md`) allows a PR based
on another open PR's branch, as a stack landed in order. That standard's 7-day limit covers each PR
in the stack.

The session-start stranded-branch check lists the stacked branch until it lands. That is
accurate: it is work in flight, and it has a draft PR that says so.
