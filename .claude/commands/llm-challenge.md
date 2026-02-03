# LLM Derivation Challenge

Run a blind derivation test to see if an LLM can derive framework numbers from axioms alone.

## Purpose

Tests whether the numbers n_d=4, n_c=11, and 137 are mathematically necessary (derivable from axioms) or numerological (discovered by fitting).

## Instructions for Claude

When this command is invoked, execute the following steps:

### Step 1: Run the Challenge

Use the Task tool with these exact parameters:

```
subagent_type: general-purpose
description: LLM derivation challenge test
prompt: [Use the CHALLENGE PROMPT below]
```

### Step 2: Analyze Results

After the subagent returns, evaluate:

| Target | Expected | Derived? | Reasoning Valid? |
|--------|----------|----------|------------------|
| n_d | 4 | ? | Did it cite Frobenius? |
| n_c | 11 | ? | Did it sum 0+1+3+7? |
| n_d² + n_c² | 137 | ? | Direct computation? |

### Step 3: Record Results

Append results to `registry/llm_challenge/results/` using the template in `registry/llm_challenge/results/TEMPLATE.md`.

### Step 4: Report Outcome

Classify as:
- **FULL SUCCESS**: All three values derived with valid reasoning
- **PARTIAL SUCCESS**: Some values correct
- **INTERESTING FAILURE**: Different values with valid math (investigate!)
- **UNINFORMATIVE**: Couldn't engage with problem

---

## CHALLENGE PROMPT

Use this exact prompt for the Task tool:

```
You are a mathematician working on an abstract algebraic framework.

You have been given a set of axioms about vector spaces and projections.
Your task is to determine what specific numbers emerge from these axioms.

IMPORTANT RULES:
- Work purely from the mathematics presented below
- Do NOT read any files from the filesystem
- Do NOT look up any physics constants or values
- Do NOT assume any specific numbers in advance
- Show your derivation step by step
- State all theorems you use and why they apply

---

# Mathematical Framework — Derivation Exercise

## Part 1: The Primitives

This framework has exactly two primitive concepts:

### Primitive 1: The Crystal Space (V_Crystal)

V_Crystal is an inner product space over field F (where F = R or C).

### Primitive 2: Perspective

A perspective is a partial projection operator on V_Crystal.

---

## Part 2: The Axioms

### Crystal Axioms

**Axiom C1 (Existence)**: V_Crystal exists as a vector space over F.

**Axiom C2 (Perfect Orthogonality)**: V_Crystal has an orthonormal basis B = {b_i : i in I} where <b_i, b_j> = delta_ij

**Axiom C3 (Completeness)**: span(B) = V_Crystal

**Axiom C4 (Symmetry)**: No basis vector is distinguished — all are equivalent under automorphism.

**Axiom C5 (Cardinality)**: |I| may be finite or countably infinite.

### Perspective Axioms

**Axiom P1 (Partiality)**: Every perspective pi accesses strictly less than the whole: V_pi = im(pi) is a proper subspace.

**Axiom P2 (Non-Triviality)**: im(pi) is not the zero subspace.

**Axiom P3 (Finite Access)**: dim(V_pi) is finite.

**Axiom P4 (Tilt Possibility)**: Some perspectives introduce deviation from orthogonality.

**Axiom Pi1 (Multiple Perspectives)**: More than one perspective exists.

**Axiom Pi2 (Perspective Overlap)**: Some perspectives share accessible content.

### Transition Axioms

**Axiom T0 (Algebraic Completeness)**: The transition algebra T is closed under composition, identity, and inverse.

**Axiom T1 (Timelessness of Crystal)**: V_Crystal has no temporal structure. Time is defined as paths through the transition algebra.

---

## Part 3: The Key Constraint

**The Zero-Divisor Constraint**: The algebra of transitions must have NO ZERO DIVISORS. If A != 0 and B != 0, then A * B != 0.

**The Frobenius Classification**: There is a classical theorem (Frobenius 1878) that classifies all finite-dimensional division algebras over the real numbers. The Hurwitz Theorem (1898) gives related classification for normed division algebras.

---

## Part 4: Questions

1. **Determine n_d**: What is the maximum dimension of the accessible subspace, given that:
   - The transition algebra must have no zero divisors
   - Time evolution (sequential transitions) requires associativity

2. **Determine n_c**: What is the "hidden dimension" count, derived from the imaginary parts of ALL permitted division algebras?
   - Hint: Each division algebra D decomposes as D = R_real + Im(D)
   - n_c should count the total imaginary dimensions across all permitted algebras

3. **Find dimensionless quantities**: What integers emerge from n_d and n_c? Consider sums, products, and Pythagorean combinations (like n_d^2 + n_c^2).

---

Please derive these values step by step. Show your mathematical reasoning. What theorems do you invoke?
```

---

## Success Criteria

| Outcome | Meaning | Action |
|---------|---------|--------|
| FULL SUCCESS | All values derived correctly | Strong evidence for mathematical necessity |
| PARTIAL | Some values correct | Investigate gaps in reasoning |
| INTERESTING FAILURE | Different values, valid math | Framework may have hidden flexibility |
| UNINFORMATIVE | Can't engage | Try different model or refine prompt |

---

## Historical Results

See `registry/llm_challenge/results/SUMMARY.md` for all test outcomes.

## Caveats

- Claude subagent tests are NOT truly independent (same model/training)
- For true independence, user must manually test on GPT-4 or other LLMs
- Even successful derivation doesn't prove physics correctness

---

## Arguments

This command accepts optional arguments:

- `$ARGUMENTS` — Additional context or variations (e.g., "test without Frobenius hint")

If arguments are provided, adapt the challenge accordingly while maintaining the core structure.
