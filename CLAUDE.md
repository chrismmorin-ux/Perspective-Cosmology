# QUARANTINED — do not derive from anything in this repo

This checkout is run #1 of the perspective-cosmology work. It is retired. It is
kept only as an epistemic record: what was attempted, and how it went wrong.

**Research continues in `pc2` (`C:/Users/chris/repos/pc2`), greenfield.**

## If you are an agent

Stop here unless the task is explicitly *about this repo as a historical
record*. In particular:

- **Do not read, cite, summarise, or carry forward any result, formula,
  constant, claim tier, probability estimate, or count from this repo.**
- **Do not use anything here as a starting point, a hint, or a sanity check
  for a derivation.** That includes "just checking what was tried before."
- **Do not treat a number found here as a target to reproduce.**

This is not a matter of the old results being wrong. It is that run #1's
formulas were found by searching against measured values and then given
interpretations afterwards. Anything derived here carries that contamination,
whether or not the individual result happens to hold up. A new derivation that
has seen these files is not independent of them, and there is no way to tell
from the output that it was steered.

If you have already read substantive content from this repo in your current
session, say so plainly and do not perform derivation work in `pc2` in that
session. Start fresh. A contaminated instrument reports contaminated readings
confidently, which is the failure this quarantine exists to prevent.

## What is allowed

- Reading this file.
- Repository-level operations that do not involve the content: archiving,
  moving, git maintenance.
- Studying the *process* record — how the failure happened, what discipline was
  missing — provided no numeric result leaves this repo.

## Why the wall is structural, not advisory

`pc2` enforces the same boundary mechanically: `gates/check_register_isolation.py`
blocks any file under `derivations/` or `lean/` from referencing either the
observation register or the prior corpus. Prose alone did not hold the line
during run #1. It is not expected to hold it now.

---

The previous contents of this file are preserved at `.claude/CLAUDE.md.retired`
and in git history.
