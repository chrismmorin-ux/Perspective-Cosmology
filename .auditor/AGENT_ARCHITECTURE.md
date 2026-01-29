# Perspective Cosmology: Agent Architecture

## Overview

The framework uses specialized agents for different tasks. This document describes how they interact.

---

## Agent Roster

| Agent | Role | Stance | Modifies Files? |
|-------|------|--------|-----------------|
| `/physics-auditor` | Internal consistency checker | Neutral | No (files CRs) |
| `/maintainer` | Change implementer | Neutral | **Yes** |
| `/auditor` | Hostile adversarial reviewer | Adversarial | No |
| `/steward` | Author advocate | Supportive | No |
| `/engine` | Priority generator | Neutral | Yes (queue only) |
| `/prime-expert` | Prime number theory specialist | Neutral | No |

---

## Workflow Patterns

### Pattern 1: Audit → Fix Cycle

```
┌─────────────────┐
│ /physics-auditor │ ──── Audit files
└────────┬────────┘
         │ Findings
         ▼
┌─────────────────┐
│ CHANGE_REQUESTS │ ──── Queue of fixes needed
└────────┬────────┘
         │ (User approves)
         ▼
┌─────────────────┐
│   /maintainer   │ ──── Implement changes
└────────┬────────┘
         │ Updates
         ▼
┌─────────────────┐
│ /physics-auditor │ ──── Re-audit to verify
└─────────────────┘
```

### Pattern 2: Adversarial Review

```
┌─────────────────┐
│    /auditor     │ ──── Attack the theory
└────────┬────────┘
         │ Criticisms
         ▼
┌─────────────────┐
│    /steward     │ ──── Defend or acknowledge
└────────┬────────┘
         │ Resolution
         ▼
┌─────────────────┐
│ /physics-auditor │ ──── Verify resolution
└─────────────────┘
```

### Pattern 3: Priority Management

```
┌─────────────────┐
│     /engine     │ ──── Generate priorities
└────────┬────────┘
         │ Queue updates
         ▼
┌─────────────────┐
│ RECOMMENDATION  │ ──── What to work on
│    _ENGINE.md   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ /physics-auditor │ ──── Audit by priority
└─────────────────┘
```

---

## File System

```
.auditor/
├── INDEX.md                 # Overview
├── AGENT_ARCHITECTURE.md    # This file
├── AUDIT_PLAN.md           # Systematic review plan
├── AUDIT_PROGRESS.md       # Progress tracker
├── CHANGE_REQUESTS.md      # Queue for /maintainer
└── cache/
    ├── metadata.json       # Cache state
    ├── papers/             # External research
    ├── internal/           # Verified derivations
    ├── crossrefs/          # Dependency links
    └── conflicts/          # Logged issues

.claude/commands/
├── physics-auditor.md      # Internal auditor
├── maintainer.md           # Change implementer
├── auditor.md              # Adversarial reviewer
├── steward.md              # Author advocate
├── engine.md               # Priority generator
└── prime-expert.md         # Prime theory specialist
```

---

## Change Request Lifecycle

```
PENDING ──────┬──────> APPROVED ──────> IMPLEMENTED
              │
              └──────> REJECTED (with reason)
              │
              └──────> BLOCKED (with blocker)
```

### Status Definitions

| Status | Meaning | Who Sets |
|--------|---------|----------|
| PENDING | Filed, awaiting review | `/physics-auditor` |
| APPROVED | User approved | User |
| IMPLEMENTED | Changes made | `/maintainer` |
| REJECTED | Won't do | User |
| BLOCKED | Can't do yet | `/maintainer` |

---

## Dependency Tracking

The `/maintainer` must understand dependencies:

### Upstream (Required By Target)
```
Target file REQUIRES these to exist:
- DEF_XXXX definitions
- AXM_XXXX axioms
- THM_XXXX theorems
```

### Downstream (Requires Target)
```
These files REQUIRE target:
- Files that reference target's ID
- Files that use concepts from target
- Scripts that depend on target's values
```

### Safe Change Order
```
1. Ensure upstream complete
2. Modify target
3. Update all downstream
4. Validate no broken references
```

---

## Audit Scope by Agent

| Agent | Audits | Doesn't Audit |
|-------|--------|---------------|
| `/physics-auditor` | Internal consistency, derivations, dependencies | Presentation, strategy |
| `/auditor` | External credibility, falsifiability, methodology | Internal details |
| `/steward` | Author intent, communication clarity | Technical correctness |
| `/engine` | Priority, resource allocation | Technical content |

---

## Quick Reference

### Start Audit Cycle
```
/physics-auditor --start-phase 1A
```

### Check Status
```
/physics-auditor --progress
/physics-auditor --conflicts
```

### Implement Fixes
```
/maintainer              # Process all pending CRs
/maintainer CR-001       # Process specific CR
/maintainer --dry-run    # Preview only
```

### Adversarial Review
```
/auditor [material]
/steward [respond to audit]
```

### Get Priorities
```
/engine
```
