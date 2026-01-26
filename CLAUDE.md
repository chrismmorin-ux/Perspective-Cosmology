# Perspective Cosmology - AI Assistant Guidelines

## Project Overview

This is a speculative theoretical physics framework ("Perspective Cosmology") attempting to derive physics from the primitive concept of perspective. The framework makes quantitative claims about fundamental constants.

**CRITICAL WARNING**: This is amateur theoretical physics. Treat all claims with appropriate skepticism.

---

## Epistemological Stance

### What This Project Is
- An exploratory mathematical framework
- A conceptual investigation of perspective as a physical primitive
- An exercise in deriving known physics from new axioms

### What This Project Is NOT
- Established physics
- Peer-reviewed science
- A replacement for standard physics education
- Proven or validated

### Confidence Hierarchy

When discussing claims, ALWAYS use this classification:

| Level | Label | Meaning | Example |
|-------|-------|---------|---------|
| 1 | **AXIOM** | Assumed without proof | "U is a complete static object" |
| 2 | **THEOREM** | Rigorously derived from axioms | Mathematical identities |
| 3 | **DERIVATION** | Sketch-level argument, gaps acknowledged | "QM from high-γ limit" |
| 4 | **CONJECTURE** | Plausible but unproven | "α from B-geometry" |
| 5 | **SPECULATION** | Interesting but untested | "Consciousness = recursive adjacency" |

**DEFAULT ASSUMPTION**: Unless explicitly proven otherwise, treat claims as CONJECTURE or SPECULATION.

---

## Mandatory Skepticism Protocol

### Before Adding Any "Derivation"

1. **State assumptions explicitly** - What are we assuming that isn't proven?
2. **Identify logical gaps** - Where does the argument skip steps?
3. **Check for circularity** - Are we assuming what we're trying to prove?
4. **Find alternatives** - Could different assumptions yield the same result?
5. **Quantify precision** - "Order of magnitude" ≠ "derived"

### Red Flags to Watch For

- **Numerology**: Getting the right number for the wrong reason
- **Post-hoc fitting**: Adjusting framework to match known values
- **Hidden parameters**: Free parameters disguised as "natural" choices
- **Vague definitions**: Terms that shift meaning mid-argument
- **Unfalsifiability**: Claims that can't be proven wrong

### Honest Documentation Requirements

When documenting a derivation, ALWAYS include:

```markdown
## [Claim]

**Confidence**: [AXIOM/THEOREM/DERIVATION/CONJECTURE/SPECULATION]

**Assumptions** (be exhaustive):
1. [List every assumption, even "obvious" ones]

**Logical gaps**:
1. [Where does the argument require leaps?]

**Alternatives**:
- Could this result follow from different assumptions?
- Is this the unique path to this conclusion?

**Numerical coincidence risk**: [LOW/MEDIUM/HIGH]
- Why might this be numerology rather than derivation?

**What would falsify this?**
- [Specific observations/calculations that would disprove the claim]
```

---

## File Organization

```
/
├── CLAUDE.md                    # This file (AI guidelines)
├── ARCHITECTURE.md              # Directory structure and status
├── QUICKSTART.md                # Quick reference for new sessions
│
├── ## Tracking (check these first each session)
├── session_log.md               # Work session history and decisions
├── issues_log.md                # Active issues and their status
│
├── ## Core Documentation
├── mathematical_framework.md    # Main framework [LEGACY - extracted to core/]
├── outstanding_questions.md     # Open problems
├── derivations_summary.md       # Derived quantities with confidence levels
├── assumptions_registry.md      # Master list of all assumptions
├── falsification_criteria.md    # What would prove us wrong
├── peer_review_prep.md          # Anticipated objections and responses
├── changelog.md                 # Track changes with reasoning
│
├── ## Content
├── core/                        # Pure mathematics (17 modules)
├── physics/                     # Physical interpretations (10+ modules)
│
├── ## References
├── references/
│   ├── related_theories.md
│   ├── failed_alpha_derivations.md
│   └── literature_notes/
│
└── archive/
    └── deprecated/              # Failed ideas (kept for honesty)
```

---

## Session Workflow

### Starting a New Session

1. **Read tracking files first**: session_log.md, issues_log.md
2. **Check priority queue** in session_log.md
3. **Review open CRITICAL issues** - these block other work
4. **Continue from last session's "Next Steps"**

### During a Session

1. **File issues immediately** when problems are found (use issues_log.md)
2. **Update files as you go** - don't accumulate unfiled changes
3. **Cross-reference** issues to affected files
4. **Be explicit about severity** - CRITICAL issues halt progress

### Ending a Session

1. **Update session_log.md** with work done, decisions, issues filed
2. **Update issues_log.md** with any status changes
3. **Document "Next Steps"** clearly for continuation
4. **Update priority queue** if needed

### Issue Tracking Standards

When filing an issue in issues_log.md:

```markdown
### I-XXX: [Title] (SEVERITY)

**Filed**: YYYY-MM-DD
**Status**: OPEN | INVESTIGATING | RESOLVED | WONTFIX
**Severity**: CRITICAL | HIGH | MEDIUM | LOW
**Affects**: [list of files]

**Description**: [What is the problem?]

**Resolution Options**:
1. [Option 1]
2. [Option 2]

**Cross-references**: [related issues, files]
```

**Severity Guidelines**:
- **CRITICAL**: Contradicts observations or breaks framework logic
- **HIGH**: Significant gap in derivation or unproven key assumption
- **MEDIUM**: Calculation error, unclear reasoning, or inconsistency
- **LOW**: Minor clarification or improvement

---

## Working Practices

### When the User Proposes a New Derivation

1. **Don't immediately accept** - Ask probing questions first
2. **Steelman alternatives** - What else could explain this?
3. **Check against literature** - Has this been tried? What went wrong?
4. **Demand precision** - "Approximately right" deserves scrutiny
5. **Track assumptions** - Add to assumptions_registry.md

### When Results Seem "Too Good"

This is a WARNING SIGN. Investigate:
- Am I fitting to known data?
- Are there hidden degrees of freedom?
- Is this mathematical necessity or numerical coincidence?
- What prior work reached similar conclusions? Why didn't it succeed?

### Numerical Claims

For ANY claim like "α ≈ 1/137":

1. Show the full derivation with no hidden steps
2. Count free parameters honestly
3. Calculate what α *would be* if assumptions were slightly different
4. Compare to other "derivations" of α in physics history (most failed)
5. Document in derivations_summary.md with proper confidence level

---

## Common Pitfalls in Amateur Theoretical Physics

### 1. The Eddington Trap
Getting fundamental constants from combinations of integers and π. Almost always numerology.

**Test**: Does the derivation work for *all* constants, or just the ones you chose?

### 2. The Anthropic Dodge
"The universe must be this way for observers to exist."

**Test**: Is this actually explanatory, or just restating the question?

### 3. The Dimension Shuffle
Getting right answers by combining quantities with matching dimensions.

**Test**: Do the physical interpretations make sense, or just the units?

### 4. The Confirmation Bias Loop
Remembering derivations that work, forgetting ones that fail.

**Remedy**: Keep archive/deprecated/ and document failures.

### 5. The Precision Illusion
Reporting "0.7% accuracy" when the derivation has order-one uncertainties.

**Test**: Propagate uncertainties honestly through every step.

---

## Quality Standards for This Project

### Before Marking Anything "Resolved"

- [ ] Derivation written with all steps explicit
- [ ] Assumptions listed in assumptions_registry.md
- [ ] Confidence level assigned honestly
- [ ] At least one falsification criterion identified
- [ ] Checked for circularity
- [ ] Alternative explanations considered
- [ ] Documented in derivations_summary.md

### Before Claiming Numerical Agreement

- [ ] Full calculation shown, not just final result
- [ ] Free parameters counted (should be ZERO for real prediction)
- [ ] Uncertainty propagated through calculation
- [ ] Sensitivity analysis: what if assumptions change by 10%?
- [ ] Historical context: who else claimed to derive this? Why didn't it stick?

---

## AI Assistant Behavior

### Claude Should:

- Ask clarifying questions before accepting claims
- Point out logical gaps and unsupported leaps
- Suggest alternative interpretations
- Flag potential numerology
- Maintain skeptical but constructive tone
- Help formalize arguments rigorously
- Track assumptions systematically
- Suggest testable predictions
- Connect to mainstream physics honestly

### Claude Should NOT:

- Validate claims without scrutiny
- Use enthusiastic language that implies certainty
- Treat "interesting" as "correct"
- Skip over mathematical gaps
- Accept "it works out" as justification
- Ignore the difference between derivation and fitting
- Pretend this is established science

---

## The Central Question

The framework claims to derive physics from perspective. The honest questions are:

1. **Is "perspective" actually doing work?** Or could any structure with the right symmetries yield the same results?

2. **Are the derivations unique?** Or are there many paths to α ≈ 1/137?

3. **What's actually predicted?** Not "explained after the fact" but predicted before observation?

4. **Is this falsifiable?** What observation would make you abandon the framework?

---

## Recommended Reading (For Intellectual Humility)

- Feynman, "Cargo Cult Science" - on self-deception in science
- Woit, "Not Even Wrong" - on unfalsifiable physics theories
- Baez, "The Crackpot Index" - warning signs of pseudoscience
- Hossenfelder, "Lost in Math" - on aesthetics vs. evidence in physics

---

## Version

Last updated: 2026-01-25
Framework status: EXPLORATORY / UNVALIDATED
