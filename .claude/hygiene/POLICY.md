# Git hygiene policy — precedents

Written by brokers (`/hygiene`) for cases `kit/commands/hygiene.md` does not settle. A later broker follows a matching
precedent and does not re-decide it. Each entry is the *shape* of a case, never one instance. Ledger rows
(`.claude/hygiene/ledger.jsonl`) cite these ids.

## P-001 — an `archive/*-<date>` branch that a recorded migration pushed to preserve a duplicate copy it then deleted
- **When:** `origin/archive/<name>-YYYY-MM-DD` reads UNKNOWN ("refusing to merge unrelated histories"), and a migration
  log names that branch as where a duplicate local copy's history was preserved, checked on the remote and then deleted.
  For the 2026-07-22 OneDrive-to-repos migration that log is ai-personal `infrastructure/repo_migration_2026-07.md`
  (Phase 2 deletions, founder-approved batch).
- **Do:** keep it. Ledger it `kept`, owner `founder` (he approved the deletion that made it the only copy), with a reason
  that names the log line and says whether it holds blobs the default branch has never had. Do not move it under
  `refs/hygiene/archive/`: it already is the archive, and the log cites it by this name.
- **Why:** preserve over delete. It is the only remaining copy of a deleted folder, and its provenance is written down
  by name. Even when it holds nothing unique, deleting it buys nothing and breaks that citation.
- **Class:** OWNER (the migration's record), disposition kept
- **Written:** 2026-10-13 · MorinComputer · overnight broker (head ses-20261013-0848-0d34ce79, poker-tracker) · first seen on `remote:origin/archive/old-local-copy-2026-07-22:dc4ca5ae` (1170 files: 1130 identical
  to main, 22 in main's history, 18 differing versions found nowhere on main; contents not read, this repo is
  quarantined)
