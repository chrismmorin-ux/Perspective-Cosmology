# Invariants

Rules that must always hold true in this system. Violations are treated as high-severity findings.

---

## How to Use This File

Each invariant has:
- **ID**: `INV-NNN` for reference
- **Rule**: What must always be true
- **Check**: How to verify (command, pattern, or manual)
- **Last Verified**: When this was last checked
- **Status**: VERIFIED / UNVERIFIED / VIOLATED

The `/audit` command checks all invariants with automated checks.
The `/verify` command checks invariants relevant to recent changes.

---

## Invariants

### INV-001: Tests Must Pass
**Rule:** All tests in the test suite must pass on the main branch.
**Check Command:** `<test command>`
**Last Verified:** YYYY-MM-DD
**Status:** UNVERIFIED

### INV-002: Build Must Succeed
**Rule:** The project must build without errors.
**Check Command:** `<build command>`
**Last Verified:** YYYY-MM-DD
**Status:** UNVERIFIED

### INV-003: No Secrets in Source
**Rule:** No API keys, passwords, tokens, or credentials committed to the repository.
**Check Pattern:** `grep -rn "password\|secret\|api_key\|token" --include="*.py" --include="*.js" --include="*.ts" --include="*.env"`
**Last Verified:** YYYY-MM-DD
**Status:** UNVERIFIED

<!-- 
Add project-specific invariants:
- Data integrity rules (e.g., "every record must have a source attribution")
- Security rules (e.g., "all endpoints require authentication")
- Architecture rules (e.g., "no direct database access from presentation layer")
- Business rules (e.g., "financial calculations must use exact arithmetic")
-->
