# Claude Code Configuration Overview

This document explains the CLAUDE.md system structure for the Perspective Cosmology project.

## Why This Structure?

Based on research into Claude Code best practices:

1. **Original CLAUDE.md was 515 lines** — Best practices recommend <150 lines
2. **Frontier LLMs follow ~150-200 instructions consistently** — Every line competes for attention
3. **Claude Code supports modular rules** — `.claude/rules/*.md` for topic-specific guidance
4. **Directory-specific CLAUDE.md** — Context-sensitive instructions

## File Hierarchy

```
CLAUDE.md                    ← LEAN root file (~120 lines)
│                              Core identity + pointers
│
├── .claude/rules/           ← Modular rule files (loaded always)
│   ├── 01-confidence-tagging.md
│   ├── 02-verification-protocol.md
│   ├── 03-session-workflow.md
│   ├── 04-skepticism-checklist.md
│   └── 05-derivation-templates.md
│
├── verification/CLAUDE.md   ← Context when in verification/
├── framework/CLAUDE.md      ← Context when in framework/
├── core/CLAUDE.md           ← Context when in core/
└── registry/CLAUDE.md       ← Context when in registry/
```

## What Each File Does

### Root CLAUDE.md (~120 lines)
- Project identity and epistemological stance
- Four-layer architecture summary
- Session protocol (start/during/end)
- The "one rule" (no calculations without scripts)
- Quick navigation table
- Claude's role (do/don't)

### .claude/rules/ (Loaded for all contexts)

| File | Content |
|------|---------|
| `01-confidence-tagging.md` | [AXIOM]/[THEOREM]/[DERIVATION]/[CONJECTURE]/[SPECULATION] system |
| `02-verification-protocol.md` | SymPy-first workflow, script standards |
| `03-session-workflow.md` | Start/during/end procedures |
| `04-skepticism-checklist.md` | Red flags, pitfalls, questions to ask |
| `05-derivation-templates.md` | Templates for claims, investigations, scripts |

### Directory-Specific CLAUDE.md

| Directory | Focus |
|-----------|-------|
| `verification/` | Script standards, naming, testing |
| `framework/` | Layer system, investigation files, prime catalog |
| `core/` | Axiom/theorem formalization, Layer 0 purity |
| `registry/` | Tracking files, cross-reference integrity |

## How to Use

### For Normal Work
Just work normally. Claude Code automatically loads:
- Root CLAUDE.md
- All files in .claude/rules/
- Directory-specific CLAUDE.md when working in that directory

### To Modify Behavior
1. **Global change** → Edit root CLAUDE.md or .claude/rules/
2. **Directory-specific** → Edit that directory's CLAUDE.md
3. **Add new rule category** → Create new file in .claude/rules/

### To Add New Directory Guidelines
Create `[directory]/CLAUDE.md` with:
- Purpose of that directory
- Required sections for files
- Naming conventions
- Cross-reference requirements

## Migration Status

**COMPLETED**: 2026-01-27 (Session 90)

### What Changed

The original 515-line CLAUDE.md was refactored into:

| Old Section | New Location |
|-------------|--------------|
| Project Overview | Root CLAUDE.md |
| Four-Layer Approach | Root CLAUDE.md |
| Confidence Hierarchy | `.claude/rules/01-confidence-tagging.md` |
| Mandatory Skepticism | `.claude/rules/04-skepticism-checklist.md` |
| File Organization | Removed (Claude reads filesystem) |
| Session Workflow | `.claude/rules/03-session-workflow.md` |
| Verification Workflow | `.claude/rules/02-verification-protocol.md` |
| Working Practices | `.claude/rules/04-skepticism-checklist.md` |
| Common Pitfalls | `.claude/rules/04-skepticism-checklist.md` |
| Quality Standards | `.claude/rules/02-verification-protocol.md` |
| AI Assistant Behavior | Root CLAUDE.md |
| Templates | `.claude/rules/05-derivation-templates.md` |
| Decision Framework | `.claude/rules/06-decision-framework.md` (NEW) |

### Results

- **Before**: 515 lines in single file
- **After**: 141 lines in root + 6 modular rule files
- **Backup**: `archive/deprecated/CLAUDE.md.pre-modular`

## Verification

After migration, verify Claude Code:
1. Starts session with proper briefing
2. Auto-tags confidence levels
3. Demands SymPy scripts for calculations
4. Uses correct templates
5. Maintains skeptical-but-constructive tone

## Customization Tips

### Keep Root Lean
- Remove anything that belongs in rules/
- Remove anything the filesystem already shows
- Remove long examples (put in templates file)

### Use Rules for Enforcement
- Rules files are always loaded
- Good for non-negotiable behaviors
- Numbered for load order (01- loads before 02-)

### Use Directory CLAUDE.md for Context
- Only loaded when working in that directory
- Good for directory-specific conventions
- Can reference rules files without duplicating

## Sources

Based on:
- [Anthropic: Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Claude Code Docs: Manage Memory](https://code.claude.com/docs/en/memory)
- [Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) — HumanLayer
- [The Complete Guide to CLAUDE.md](https://www.builder.io/blog/claude-md-guide) — Builder.io
