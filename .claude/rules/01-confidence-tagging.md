# Confidence Tagging Protocol

## Mandatory Tags for Every Claim

| Level | Tag | Meaning | When to Use |
|-------|-----|---------|-------------|
| 1 | `[AXIOM]` | Assumed without proof | Foundational postulates only |
| 2 | `[THEOREM]` | Rigorously derived | Has complete proof from axioms |
| 3 | `[DERIVATION]` | Sketch-level argument | Gaps exist but path is clear |
| 4 | `[CONJECTURE]` | Plausible but unproven | **DEFAULT for new claims** |
| 5 | `[SPECULATION]` | Interesting but untested | Exploratory ideas |

## Default Behavior

**ALWAYS default to `[CONJECTURE]` unless:**
- Proof exists and is verified → `[THEOREM]`
- Defined as starting assumption → `[AXIOM]`
- Complete derivation chain documented → `[DERIVATION]`

## Assumption Sub-Tags

For any assumption used in a derivation:

| Tag | Source | Example |
|-----|--------|---------|
| `[A-AXIOM]` | Framework axiom | "U is complete static object" |
| `[A-STRUCTURAL]` | Mathematical choice | "F = C (complex field)" |
| `[A-PHYSICAL]` | Physical interpretation | "Adjacency = time" |
| `[A-IMPORT]` | Standard Model / observation | "n_color = 3" |
| `[A-TECHNICAL]` | Calculation convenience | "Leading order only" |

## Derivation Chain Tags

Every statement "X follows from Y" MUST have `[A]/[I]/[D]` tags:

- `[A]` = from Axiom (Layer 0)
- `[I]` = from Import (Layer 2 correspondence)
- `[D]` = Derived (follows from other [A]/[I]/[D])

**Example**:
```
n_d = 4 [D: from no-zero-divisors [A] + Frobenius theorem [I-MATH]]
```

## When Results Seem "Too Good"

If a derivation produces sub-percent or sub-ppm accuracy, IMMEDIATELY ask:
1. How many free parameters? (Should be ZERO)
2. Is this fitting to known data?
3. What would falsify this?
4. Has this been tried before? Why didn't it stick?

Mark high-precision claims with `**[VERIFY-PRECISION]**` until SymPy confirms.
