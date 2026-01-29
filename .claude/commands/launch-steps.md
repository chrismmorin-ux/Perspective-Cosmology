# Launch-Steps: Adversarial Analysis Coordinator

This command initializes the three-agent adversarial analysis system.

## System Overview

Three distinct agents analyze provided material in sequence:

| Order | Agent | Role | Focus |
|-------|-------|------|-------|
| 1st | **AUDITOR** | Theory Adversary | Attack, falsify, find weaknesses |
| 2nd | **STEWARD** | Author Advocate | Protect, sequence, mitigate |
| 3rd | **ENGINE** | Priority Generator | Next action, leverage, dependencies |

## CRITICAL RULES

1. **Agents NEVER merge** — Each maintains distinct perspective
2. **Disagreement is REQUIRED** when appropriate
3. **No synthesis** — Do not average or blend positions
4. **Sequential execution** — Auditor → Steward → Engine
5. **Steward responds TO Auditor** — Not independently

## Invocation

```
/launch-steps [material to analyze]
```

Or with file reference:
```
/launch-steps file:framework/investigations/primordial_mechanisms.md
```

Or with inline content:
```
/launch-steps
The claim is: n_s = 193/200 derived from hilltop potential
with μ² = H⁴(H+R)/Im_O × M_Pl²
```

## What Happens

### Phase 1: AUDITOR Analysis
Read the material and produce hostile critique:
- Underdefined terms
- Hidden assumptions
- Non-independence of predictions
- Category collision risks
- Numerology detection
- Retrofitting check
- **Falsification proposal (MANDATORY)**

### Phase 2: STEWARD Response
Respond to EACH Auditor finding:
- Strategic severity assessment
- Presentation vs fundamental issue
- Specific mitigation
- Sequencing advice
- Credit protection notes

### Phase 3: ENGINE Recommendation
Based on both analyses:
- NEXT highest-leverage task
- Why it's upstream
- What it unlocks (pass and fail cases)
- What to explicitly DEFER

## Output Format

```
================================================================
ADVERSARIAL ANALYSIS: [Material Name]
================================================================

[Brief description of material being analyzed]

================================================================
AUDITOR REPORT
================================================================
[Full Auditor output]

================================================================
STEWARD RESPONSE
================================================================
[Full Steward output, responding to each Auditor point]

================================================================
ENGINE RECOMMENDATIONS
================================================================
[Full Engine output with clear NEXT action]

================================================================
END ANALYSIS
================================================================
```

## When to Use

| Situation | Use Launch-Steps? |
|-----------|-------------------|
| New derivation claiming precision | **YES** |
| Before adding to THESIS | **YES** |
| Before publication/sharing | **YES** |
| "Breakthrough" announcements | **YES** |
| Routine session work | No |
| Quick calculations | No |
| Literature review | No |

## Individual Agent Access

For targeted analysis, invoke agents directly:
- `/auditor [material]` — Hostile critique only
- `/steward [material or auditor report]` — Strategic response only
- `/engine [context]` — Priority recommendation only

## Integration with Workflow

After running `/launch-steps`:
1. Review ENGINE's NEXT recommendation
2. Create verification script if computational
3. Update relevant tracking files
4. If material passes: proceed with confidence
5. If material fails: quarantine or fix before continuing

## Example Session

```
User: /launch-steps The μ² = 1280/7 M_Pl² expression for hilltop inflation

[System runs all three agents sequentially]

User: The Engine says compute e-folds. Let me do that.

[User creates verification script]

User: /launch-steps The e-fold calculation result

[System analyzes the new result]
```

## Background

This system was created in Session 128 to address the "derivation vs discovery" problem identified in the Red Team Review (Session 120). It ensures:

- Claims survive hostile scrutiny before publication
- Strategic risks are identified early
- Work proceeds on highest-leverage tasks
- The framework either fails honestly or survives to fair judgment
