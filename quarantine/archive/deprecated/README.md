# Deprecated Ideas Archive

This folder contains ideas that were explored and abandoned.

**Purpose**: Intellectual honesty requires documenting failures, not just successes.

---

## Why Keep Failed Ideas?

1. **Prevent re-invention** - Don't repeat mistakes
2. **Show rigor** - Real research has dead ends
3. **Track evolution** - How thinking developed
4. **Counter confirmation bias** - Remember what didn't work

---

## Current Contents

### CLAUDE.md.pre-modular
**Date deprecated**: 2026-01-27
**Original location**: Root `CLAUDE.md`
**What it was**: Monolithic 515-line AI assistant guidelines file
**Why abandoned**: Migrated to modular system with lean root + `.claude/rules/` files
**Where current work is**:
- `CLAUDE.md` (141 lines)
- `.claude/rules/01-confidence-tagging.md`
- `.claude/rules/02-verification-protocol.md`
- `.claude/rules/03-session-workflow.md`
- `.claude/rules/04-skepticism-checklist.md`
- `.claude/rules/05-derivation-templates.md`
- `.claude/rules/06-decision-framework.md`

### alpha_derivation.md
**Date deprecated**: 2026-01-25
**Original location**: Early framework exploration
**What it was**: Initial attempt at deriving α from perspective axioms
**Why abandoned**: Superseded by n_d² + n_c² = 137 derivation achieving 0.27 ppm
**Where current work is**: `framework/investigations/ALPHA_DERIVATION_MASTER.md`

---

## Template for New Deprecations

When moving an idea here, document:

```markdown
# [Idea Name]

**Date deprecated**: YYYY-MM-DD

**Original location**: [Where it was in the framework]

**What it was**: [Brief description]

**Why it seemed promising**: [What made us try this]

**Why abandoned**:
1. [Reason 1]
2. [Reason 2]

**What we learned**: [Lessons for future work]

**Could it be revived?**: [Under what conditions might this work?]
```

---

## See Also

- `archive/physics_deprecated/` — Superseded physics investigations
- `archive/explorations_v1/` — Early exploration work
- `archive/meta_plans/` — Completed planning documents

---

*Last updated: 2026-01-27 (Session 90b)*
