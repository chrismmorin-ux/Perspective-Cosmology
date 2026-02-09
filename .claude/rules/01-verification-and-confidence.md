# Verification, Confidence & Skepticism

## Confidence Tags (mandatory for every claim)

| Tag | Meaning | When |
|-----|---------|------|
| `[AXIOM]` | Assumed without proof | Foundational postulates only |
| `[THEOREM]` | Rigorously derived | Has complete proof from axioms |
| `[DERIVATION]` | Sketch-level argument | Gaps exist but path is clear |
| `[CONJECTURE]` | Plausible but unproven | **DEFAULT for new claims** |
| `[SPECULATION]` | Interesting but untested | Exploratory ideas |

**Default**: Always `[CONJECTURE]` unless proven otherwise.

## Assumption Sub-Tags

| Tag | Source | Example |
|-----|--------|---------|
| `[A-AXIOM]` | Framework axiom | "U is complete static object" |
| `[A-STRUCTURAL]` | Mathematical choice | "F = C (complex field)" |
| `[A-PHYSICAL]` | Physical interpretation | "Adjacency = time" |
| `[A-IMPORT]` | Standard Model / observation | "n_color = 3" |
| `[A-TECHNICAL]` | Calculation convenience | "Leading order only" |

Every "X follows from Y" MUST have `[A]/[I]/[D]` tags tracing the derivation chain.

## The Cardinal Rule

**No calculation in markdown without a verification script.**

Workflow: CLAIM -> SCRIPT (`verification/sympy/`) -> RUN (confirm PASS) -> DOCUMENT with script reference.

## SymPy Script Requirements

Every script MUST: state assumptions explicitly, perform calculation, compare to measurement, include verification tests with PASS/FAIL output. See `docs/derivation-templates-full.md` for full templates.

## Hallucination Risk Score (HRS)

Calculate for every derivation: Matches known value? +2. "It can be shown" language? +2. No intermediate steps? +3. Seems "too good"? +2. Multiple verifications? -2. Clear derivation chain? -2.

**HRS >= 4**: Require multi-path verification. Ask "What would make this wrong?"

## Red Flags (Stop and Investigate)

1. **Eddington Trap**: Getting constants from integer/pi combinations. Test: Does derivation work for ALL constants?
2. **Confirmation Bias**: Remembering successes, forgetting failures. Remedy: Document failed attempts in `archive/deprecated/`
3. **Precision Illusion**: Final precision better than intermediate steps. Test: Propagate uncertainties honestly
4. **Hidden Parameters**: "Natural" choices are often hidden free parameters. Count parameters honestly (should be ZERO)
5. **Post-hoc Fitting**: Adjusting framework to match known values. Test: Would you have predicted this BEFORE knowing the measurement?

## When Results Seem "Too Good"

Mark with `**[VERIFY-PRECISION]**`. Check: How many free parameters? Is this fitting? What would falsify? Has this been tried before?

## Blind Prediction Protocol

For critical claims: State hypothesis -> Lock prediction -> Define tolerance -> Check measurement -> Document result.
