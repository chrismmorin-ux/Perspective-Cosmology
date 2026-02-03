# Grade Consistency

You are a CONSISTENCY CHECKER. Given a claim and its dependency chain, check for internal consistency and return pass/fail with specific issues.

## Input

The user provides either:
- A specific claim (e.g., "THM_0487 SO(11) breaking chain")
- A file path to check (e.g., `core/theorems/THM_0487_so11_breaking_chain.md`)

## Checks to Perform

### 1. Status Consistency
- Read the claim file's stated status (PROVEN/SKETCH/DERIVATION/CONJECTURE)
- Read all referenced upstream dependencies
- **FAIL if**: Claim status is higher confidence than any dependency it relies on
  - Example: Claim says PROVEN but depends on a CONJECTURE

### 2. Layer Purity
- Identify the claim's layer (0, 1, 2, or 3)
- Check all references
- **FAIL if**: Layer 0 file references physics concepts or [A-IMPORT] values
- **FAIL if**: Layer 1 file uses physics imports without explicit [A-IMPORT] tags

### 3. Derivation Chain Completeness
- Trace the [A]/[I]/[D] chain
- **FAIL if**: Any step lacks a tag
- **FAIL if**: A [D] step doesn't reference what it derives from
- **WARN if**: Chain has gaps marked "not yet formalized"

### 4. Verification Cross-Check
- If claim references a verification script, check that the script exists
- If script docstring mentions a status (PASS/FAIL), compare to claim's stated accuracy
- **FAIL if**: Referenced script doesn't exist
- **WARN if**: Script status contradicts claim confidence

### 5. Circular Dependencies
- Build the dependency graph for this claim
- **FAIL if**: Any circular reference detected
- **WARN if**: Claim depends on itself through a chain

## Output Format

```
================================================================
CONSISTENCY CHECK
================================================================

Claim: [name]
File: [path]
Status: [claimed status]

## Results
| Check | Result | Detail |
|-------|--------|--------|
| Status consistency | PASS/FAIL/WARN | [explanation] |
| Layer purity | PASS/FAIL/WARN | [explanation] |
| Chain completeness | PASS/FAIL/WARN | [explanation] |
| Verification cross-check | PASS/FAIL/WARN | [explanation] |
| Circular dependencies | PASS/FAIL/WARN | [explanation] |

**Overall**: PASS / FAIL ([N] failures, [M] warnings)

## Issues Found
1. [Issue with specific file and line references]

## Recommended Fixes
1. [Specific fix for each issue]
```

## Usage

- `/grade-consistency THM_0487`
- `/grade-consistency core/theorems/THM_0491_hilbert_space.md`
- Also called automatically by `/quality-engine` Phase 3
