# Physics Auditor Knowledge Base

**Location**: `.auditor/`
**Command**: `/physics-auditor`

## Directory Structure

```
.auditor/
├── INDEX.md              # This file
├── cache/
│   ├── metadata.json     # Index of all cached items
│   ├── papers/           # External research summaries
│   ├── internal/         # Verified PC derivations
│   ├── crossrefs/        # Source-to-derivation links
│   └── conflicts/        # Logged inconsistencies
```

## Purpose

This knowledge base supports the Theoretical Physics Auditor agent (`/physics-auditor`), which performs:

- Internal consistency audits
- Derivation correctness verification
- Dependency hygiene checks
- Pattern legitimacy assessment

## Distinction from `/auditor`

The `/auditor` agent is an *adversarial* external reviewer.
The `/physics-auditor` agent is an *internal* quality control system.

Both are valuable but serve different purposes.

## Cache Statistics

See `cache/metadata.json` for current counts.

## Usage

```
/physics-auditor [material]           # Audit specific material
/physics-auditor --status             # Check cache state
/physics-auditor --conflicts          # List open conflicts
```
