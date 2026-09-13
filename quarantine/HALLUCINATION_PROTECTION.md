# Hallucination Protection Protocol

**Purpose**: Systematic defenses against LLM-generated mathematical hallucinations.

**Core Problem**: LLMs can generate plausible-looking "proofs" that are wrong. Claude cannot verify math by reasoning alone — computational verification is necessary but not sufficient.

---

## The Three Defense Layers

### Layer 1: Computational Verification (EXISTING)

**Tool**: SymPy scripts
**Rule**: No calculation in markdown without a verification script.
**Status**: IMPLEMENTED (85% pass rate, 76 scripts)

### Layer 2: Multi-Path Verification (NEW)

**Principle**: A correct result should be reachable by multiple independent methods.

**Implementation**:
```
For any sub-percent precision claim:
1. PRIMARY: Original derivation path
2. SECONDARY: Alternative derivation (different starting point)
3. NUMERICAL: Independent numerical check (mpmath/scipy)
4. EXTERNAL: Wolfram Alpha cross-check (budget permitting)
```

**Consistency Metric**:
- If PRIMARY ≠ SECONDARY: INVESTIGATE
- If NUMERICAL deviates by >0.01%: FLAG
- If EXTERNAL disagrees: QUARANTINE

### Layer 3: Semantic Consistency (NEW)

**Principle**: Hallucinated derivations often have subtle semantic inconsistencies.

**Checks**:
1. **Dimensional analysis**: Do units work at every step?
2. **Limit behavior**: Does result reduce to known cases?
3. **Symmetry preservation**: Are symmetries maintained throughout?
4. **Sign consistency**: Are signs correct under conjugation/parity?

---

## Hallucination Warning Signs

### Mathematical Red Flags

| Warning Sign | Example | Action |
|--------------|---------|--------|
| **"It can be shown"** | Skipping steps | DEMAND explicit derivation |
| **"Approximately equal"** | Hiding error | REQUIRE exact form + error |
| **"After simplification"** | Black box | SHOW intermediate steps |
| **"By symmetry"** | Handwaving | VERIFY symmetry applies |
| **"Order of magnitude"** | Imprecision | COMPUTE actual value |

### Derivation Chain Red Flags

| Warning Sign | Meaning | Action |
|--------------|---------|--------|
| Gap in [A]/[I]/[D] tags | Unmarked assumption | ADD explicit tag |
| Import disguised as axiom | Hidden input | MOVE to Layer 2 |
| Circular reference | A depends on B depends on A | BREAK cycle or FLAG |
| Precision inflation | Final precision > any input | PROPAGATE uncertainties |

---

## Enhanced Verification Protocol

### Before Accepting ANY New Derivation

```
VERIFICATION CHECKLIST v2.0

□ 1. COMPUTATIONAL
   □ SymPy script written and PASS
   □ Script shows ALL intermediate steps (not just final answer)
   □ Script includes ASSERTIONS for expected values

□ 2. MULTI-PATH (for sub-percent claims)
   □ Alternative derivation attempted
   □ Results agree to stated precision
   □ If disagree: discrepancy documented and investigated

□ 3. SEMANTIC
   □ Dimensional analysis verified
   □ Limit behavior checked
   □ No "magic" cancellations unexplained

□ 4. INDEPENDENCE
   □ Result not post-hoc fitted to known value
   □ Prediction was stated BEFORE comparison
   □ Parameter count is ZERO (no hidden fitting)

□ 5. DOCUMENTATION
   □ All assumptions tagged [A-AXIOM/IMPORT/etc]
   □ Derivation chain complete with [A]/[I]/[D]
   □ Falsification criterion stated
```

---

## Session Protocol Updates

### During Session

**When Claude produces a calculation:**
1. STOP before accepting
2. Ask: "Show me the intermediate steps"
3. Ask: "What would make this wrong?"
4. Run SymPy verification
5. Only THEN document

**When Claude says "it follows that":**
1. CHALLENGE: "What specifically follows from what?"
2. DEMAND: Explicit [A]/[I]/[D] chain
3. VERIFY: Each step independently if possible

### Hallucination Scoring

For each new claim, assign a Hallucination Risk Score (HRS):

| Factor | Score |
|--------|-------|
| Computation matches known value | +2 RISK |
| "It can be shown" language | +2 RISK |
| No intermediate steps given | +3 RISK |
| Result seems "too good" | +2 RISK |
| Multiple independent verifications | -2 RISK |
| Clear derivation chain | -2 RISK |
| Falsification criterion stated | -1 RISK |

**Total HRS**:
- 0 or negative: LOW risk
- 1-3: MEDIUM risk (extra scrutiny)
- 4+: HIGH risk (require multi-path verification)

---

## Specific LLM Failure Modes

### Mode 1: Confident Calculation Errors

**What happens**: Claude performs arithmetic/algebra that looks correct but contains subtle errors.

**Defense**:
- NEVER trust Claude's algebra — always verify in SymPy
- Especially suspicious: simplifications, cancellations, limit evaluations

### Mode 2: Plausible But Wrong Proofs

**What happens**: Claude constructs a proof that has the right structure but invalid steps.

**Defense**:
- Verify EACH step independently
- Ask "Why does step N follow from step N-1?"
- Check if conclusion actually follows from premises

### Mode 3: Hidden Circularity

**What happens**: Claude assumes the result it's trying to prove, disguised as a "reasonable assumption."

**Defense**:
- Trace dependency chain to roots
- Verify every [A] tag points to genuine axiom
- Be suspicious of "natural" assumptions

### Mode 4: Pattern Matching to Known Results

**What happens**: Claude recognizes the expected answer and constructs a path to it.

**Defense**:
- Derive BEFORE revealing the target value
- Check if the derivation would predict a DIFFERENT value if you changed inputs
- Perform sensitivity analysis

---

## Implementation: Enhanced Verification Scripts

### Script Template v2.0

```python
#!/usr/bin/env python3
"""
[Title]: [What this verifies]

Hallucination Protection: MULTI-PATH VERIFICATION
"""

from sympy import *
from sympy import Rational as R
import warnings

# ==============================================================================
# PRIMARY DERIVATION
# ==============================================================================

def primary_derivation():
    """Main derivation path with intermediate steps."""
    # Step 1
    step1 = ...
    assert step1 == expected1, f"Step 1 failed: {step1} != {expected1}"

    # Step 2
    step2 = ...
    assert step2 == expected2, f"Step 2 failed: {step2} != {expected2}"

    # Final
    result = ...
    return result, {'step1': step1, 'step2': step2}

# ==============================================================================
# SECONDARY DERIVATION (DIFFERENT PATH)
# ==============================================================================

def secondary_derivation():
    """Alternative derivation for consistency check."""
    # Different approach reaching same result
    ...
    return result

# ==============================================================================
# NUMERICAL CHECK
# ==============================================================================

def numerical_check():
    """Independent numerical verification."""
    from mpmath import mp
    mp.dps = 50  # High precision
    ...
    return float(result)

# ==============================================================================
# VERIFICATION
# ==============================================================================

def main():
    primary, steps = primary_derivation()
    secondary = secondary_derivation()
    numerical = numerical_check()

    # Consistency checks
    print("=== MULTI-PATH VERIFICATION ===")
    print(f"Primary:   {primary} = {float(primary)}")
    print(f"Secondary: {secondary} = {float(secondary)}")
    print(f"Numerical: {numerical}")

    # Agreement test
    if primary != secondary:
        warnings.warn(f"PATHS DISAGREE: {primary} vs {secondary}")
        return False

    if abs(float(primary) - numerical) / numerical > 1e-10:
        warnings.warn(f"NUMERICAL MISMATCH: {float(primary)} vs {numerical}")
        return False

    print("[PASS] All paths agree")
    return True

if __name__ == "__main__":
    main()
```

---

## Tracking: Hallucination Incidents

When a hallucination is CAUGHT (not just suspected), document it:

```markdown
### H-XXX: [Brief description]

**Date**: YYYY-MM-DD
**Session**: N
**Type**: [Calculation error | Invalid proof | Hidden circularity | Pattern matching]
**How caught**: [Which defense layer]
**Original claim**: [What was claimed]
**Actual result**: [What's correct]
**Lesson**: [What to watch for]
```

File: `registry/HALLUCINATION_LOG.md` (create if needed)

---

## Quick Reference

### When to Be MOST Suspicious

1. Results that match known values "exactly"
2. Derivations with no failed attempts mentioned
3. "Clean" results with no messy intermediate steps
4. Claims at higher precision than inputs
5. Results that confirm what we hoped to find

### Defensive Questions

- "What would falsify this?"
- "Show me the intermediate steps"
- "What alternative derivation would give the same result?"
- "What assumption am I making that I haven't stated?"
- "What would the result be if I changed X by 10%?"

---

## Status Integration

Add to STATUS_DASHBOARD.md:

```markdown
## Hallucination Protection

| Metric | Value |
|--------|-------|
| Multi-path verified claims | X |
| Hallucinations caught | X |
| High-HRS claims pending review | X |
```

---

*Trust but verify. Then verify again by a different path.*
