# Rigor Protocol

**Purpose**: Integrate verification tools into the workflow to make claims legitimate, not just organized.

**Core principle**: A physicist doesn't care about folder structure. They care whether your math is right and whether you're hiding assumptions.

---

## The Three Verification Layers

### 1. Symbolic Computation (MANDATORY for all calculations)

**Tool**: SymPy (free, Python-based) or Mathematica

**Rule**: Every algebraic manipulation must have a computational verification file.

**Location**: `verification/sympy/` or `verification/mathematica/`

**Standard**:
```python
# verification/sympy/alpha_from_sin2theta.py
from sympy import *

# State assumptions explicitly
n_EW = 5  # IMPORT: electroweak dimension
sin2_theta_W = Rational(2, 9)  # CLAIM: derived from ratio

# Calculation
alpha = sin2_theta_W / (2 * pi * n_EW)

# Result
print(f"α = {alpha} = {float(alpha):.6f}")
print(f"1/α = {1/alpha} = {float(1/alpha):.2f}")

# Compare to known value
alpha_measured = 1/137.036
print(f"Deviation: {abs(float(alpha) - alpha_measured)/alpha_measured * 100:.2f}%")
```

**Process**:
1. Before claiming any calculation in markdown, write the SymPy script
2. Run it, verify it works
3. Link to verification file in the markdown claim
4. If the script doesn't reproduce your claim, your claim is wrong

### 2. Formal Axiom Statement (TARGET for Layer 0)

**Tool**: Lean 4 with Mathlib (aspirational but valuable)

**Purpose**: Force precision in axiom statements

**Minimum standard**: Axioms must be statable in predicate logic, even if not machine-verified.

**Example**:
```
-- Informal: "U is a complete static object containing all perspectives"
-- Semi-formal:
∀ p ∈ P : p is a perspective in U
U = (P, Σ, Γ, C, V, B)  -- structure tuple
|P| < ∞                  -- finiteness
∀ p, q ∈ P : ∃ path(p,q) in Σ  -- connectivity
```

**Process**:
1. For each axiom in Layer 0, write the semi-formal version
2. Identify which require set theory, topology, algebra
3. Flag any axiom that can't be stated precisely (this is a problem)

**Aspirational**: Eventually encode in Lean 4 to verify Layer 1 derivations

### 3. Derivation Chains (REQUIRED for any "derived" claim)

**Standard**: No claim marked "DERIVATION" or higher without explicit chain.

**Format**:
```
CLAIM: α ≈ 1/137

DERIVATION CHAIN:
[A1] Layer 0: γ ∈ [0,1] (Axiom U3)
[A2] Layer 0: B is a finite-dimensional space (Axiom U2)
[I1] Layer 2 Import: dim(B) = 10 (from GUT analogy) ← NOT DERIVED
[I2] Layer 2 Import: n_color = 3, n_weak = 2 (from SM) ← NOT DERIVED
[D1] Layer 1: n_EW = dim(B) - n_color - n_weak = 5 (arithmetic)
[I3] Layer 2 Import: sin²θ_W = n_EW/(n_EW + n_color + n_weak + 1) = 5/11? ← WRONG, CHECK
[D2] Actually claimed: sin²θ_W = n_weak/(n_weak + n_color)² = 2/25? ← VERIFY

VERIFICATION: sympy/alpha_derivation.py
STATUS: INCOMPLETE - multiple formulas claimed, need to verify which
```

**Process**:
1. List every step
2. Mark each as [A] Axiom, [I] Import, [D] Derivation
3. Link to SymPy verification
4. If chain has gaps, claim cannot be "DERIVATION" level

---

## Workflow Integration

### Before Any Session

1. Check `verification/` folder is set up
2. Have Python + SymPy available
3. Review which calculations need verification

### During Work

| Action | Required Verification |
|--------|----------------------|
| State a calculation | Write SymPy script first |
| Claim something "follows" | Write derivation chain |
| Add an axiom | Write semi-formal statement |
| Say "approximately X" | Calculate exact value + error |

### Before Marking Anything "Derived"

- [ ] SymPy script exists and runs
- [ ] Derivation chain written with [A]/[I]/[D] tags
- [ ] All imports marked explicitly
- [ ] No unmarked assumptions

---

## File Structure Update

```
Perspective Universe/
├── framework/
│   ├── layer_0_axioms.md          # Pure axioms
│   ├── layer_0_axioms.lean        # (Aspirational) Lean encoding
│   ├── layer_1_mathematics.md     # Mathematical consequences
│   ├── layer_2_correspondence.md  # Explicit imports
│   └── layer_3_predictions.md     # Predictions with derivation chains
│
├── verification/                   # NEW: All computational verification
│   ├── sympy/
│   │   ├── alpha_derivation.py
│   │   ├── sin2theta_calculation.py
│   │   ├── coupling_ratios.py
│   │   └── ...
│   ├── mathematica/               # If available
│   │   └── *.nb
│   └── lean/                      # Aspirational
│       └── axioms.lean
│
├── RIGOR_PROTOCOL.md              # This file
├── PLAN_ORDERED.md                # Execution plan
└── ...
```

---

## Physicist-Ready Criteria

### "Interesting Enough to Look At"

A physicist will look if:
1. **Novel claim**: Something that isn't obviously wrong AND hasn't been tried before
2. **Clear statement**: They can understand the claim in 2 minutes
3. **Falsifiable**: There's a way it could be wrong
4. **Not obviously numerology**: The structure does work, not just the numbers

### "Concrete Enough to Be Legitimate"

A physicist will take it seriously if:
1. **Axioms are precise**: Could be formalized (even if not yet)
2. **Calculations are verified**: SymPy/Mathematica backing every claim
3. **Imports are explicit**: No hidden assumptions
4. **Derivations are complete**: No "and then α ≈ 1/137 follows"

### Red Flags That Kill Credibility

- Claiming derivation without showing steps
- "Approximately" without error analysis
- Matching known values without counting free parameters
- Vague axioms that shift meaning
- Excessive documentation hiding lack of content

---

## Model Usage Guidelines

### What Claude (any LLM) Is Good For
- Organizing ideas
- Suggesting approaches
- Catching some logical errors
- Writing documentation
- Explaining concepts

### What Claude Cannot Do
- Verify mathematics (can hallucinate "proofs")
- Guarantee calculations are correct
- Replace computational verification
- Substitute for physicist evaluation

### Effective Prompting for Rigor

**Bad**: "Does this derivation work?"
**Good**: "Here's my derivation. I'll verify it in SymPy. What assumptions am I making that I haven't stated?"

**Bad**: "Derive α from the framework"
**Good**: "Given these explicit axioms and imports, what mathematical steps would connect to α? I'll verify each step computationally."

### Alternative Models

| Model | Use Case | Limitation |
|-------|----------|------------|
| Claude Opus | Synthesis, organization, writing | Can hallucinate math |
| GPT-4/o1 | Extended reasoning chains | Same limitation |
| Gemini | Code generation for verification | Same limitation |
| Lean 4 | Actual proof verification | Steep learning curve |
| SymPy | Symbolic computation | Not a reasoner |

**Recommendation**: Use LLMs for ideation and organization, but NEVER trust an LLM-generated calculation without computational verification.

---

## Minimum Viable Rigor

If full formalization is too much, at minimum:

1. **Every calculation has a SymPy script** (non-negotiable)
2. **Every "derivation" has explicit [A]/[I]/[D] chain** (non-negotiable)
3. **Layer 2 imports are listed in one place** (non-negotiable)
4. **Axioms are stated precisely enough to be wrong** (non-negotiable)

Optional but valuable:
- Lean 4 formalization of axioms
- Sensitivity analysis (what if parameters change?)
- Historical comparison (who else tried this?)

---

## Getting Started

### Setup (One-time)

```bash
# Install SymPy for symbolic computation
pip install sympy

# Verify installation
python -c "from sympy import *; print('SymPy ready')"
```

### Immediate Actions

1. Install SymPy (see above)
2. Run example script: `python verification/sympy/example_sin2theta.py`
3. Pick ONE calculation from the framework
4. Write SymPy verification for it
5. Write derivation chain with [A]/[I]/[D] tags
6. Update the markdown to link to verification

### First Verification Target

Suggest: The sin²θ_W = 2/9 claim
- It's specific (a number)
- It's claimed as derived
- It can be checked against measured value
- The derivation chain will reveal hidden imports

Example script provided: `verification/sympy/example_sin2theta.py`

---

## The Honest Question

Before any session, ask:

> "If a physicist spent 30 minutes on this, would they find:
> (a) Precise axioms they can evaluate?
> (b) Verified calculations they can trust?
> (c) Explicit imports they can critique?
> (d) A novel insight worth their time?
>
> Or would they find vague claims, unverified math, and hidden assumptions?"

If (b), we're not ready yet.

---

*Rigor isn't about documentation. It's about being precise enough to be wrong.*
