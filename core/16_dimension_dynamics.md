# [16] Dimension Dynamics

**Status**: ACTIVE
**Confidence**: [DERIVATION] for definitions, [CONJECTURE] for physical interpretation
**Dependencies**: 00_notation, 05_overlap, 13_crystallinity, 15_nucleation
**Verified**: Partial (structural arguments)

---

REQUIRES: 00_notation, 05_overlap, 13_crystallinity, 15_nucleation
DEFINES: symmetric comparison, antisymmetric comparison, dimension emergence
CONTENT-TYPE: DEFINITION + DERIVATION + CONJECTURE

## Connections

**Forward** (modules that use this):
- physics/black_holes.md (recrystallization as dimension collapse)
- physics/ (cosmology, expansion)

**Backward** (modules this uses):
- 05_overlap (γ definition)
- 13_crystallinity (Var, orthogonality)
- 15_nucleation (defect emergence)

---

## 1. Two Types of Comparison

Given two perspectives π₁ and π₂, their relationship decomposes into two parts:

### 1.1 Symmetric Comparison

**Definition (Symmetric Comparison)**
```
S(π₁, π₂) = γ(π₁, π₂) = dim(V_{π₁} ∩ V_{π₂}) / dim(V_{π₁} + V_{π₂})
```

**Properties:**
```
S(π₁, π₂) = S(π₂, π₁)           (symmetric)
S(π, π) = 1                      (self-comparison is maximal)
S measures: what perspectives SHARE
```

### 1.2 Antisymmetric Comparison

**Definition (Antisymmetric Comparison)**
```
A(π₁, π₂) = f(π₁, π₂) - f(π₂, π₁)
```

Where f is any directed comparison (e.g., projection, information flow).

**Properties:**
```
A(π₁, π₂) = -A(π₂, π₁)          (antisymmetric)
A(π, π) = 0                      (self-comparison vanishes)
A measures: what's DIFFERENT between perspectives
```

---

## 2. The Key Insight: Antisymmetric Creates Dimensions

### 2.1 Self-Reference vs External Reference

| Type | Self-comparison | Existence requirement |
|------|-----------------|----------------------|
| Symmetric | S(π,π) = 1 ≠ 0 | Can exist alone |
| Antisymmetric | A(π,π) = 0 | REQUIRES another perspective |

**Theorem D.1 (Antisymmetric Requires Relation)**
```
If A(π₁, π₂) ≠ 0, then π₁ ≠ π₂.

Proof: A(π, π) = f(π,π) - f(π,π) = 0 by definition. ∎
```

### 2.2 Dimension Emergence

When two perspectives have non-zero antisymmetric comparison:

```
A(π₁, π₂) ≠ 0
```

This **defines a new accessible direction** — the "difference vector" between their views.

**Theorem D.2 (Antisymmetric Comparison Creates Direction)**
```
Let π₁ access V_{π₁} and π₂ access V_{π₂}.
Let A(π₁, π₂) ≠ 0.

Then the combination (π₁, π₂) accesses:
  V_{π₁} + V_{π₂} ⊇ V_{π₁}

The antisymmetric part corresponds to:
  V_{π₂} \ V_{π₁}  (what π₂ sees that π₁ doesn't)

This is a NEW direction relative to π₁ alone.
```

**Physical meaning:**
- Single perspective: fixed accessible dimensions
- Two perspectives with A ≠ 0: their combination "sees" more
- The antisymmetric comparison literally creates new accessible structure

---

## 3. The Dimension Lifecycle

### 3.1 Crystal State (No Dimensions Accessible)

```
Crystal C: Var(C) = 0, perfect orthogonality

All comparisons are symmetric (self-referential).
A(·,·) = 0 everywhere (no distinct perspectives).
No accessible dimensions — only potential structure.
```

### 3.2 Nucleation (First Dimensions Emerge)

```
First non-trivial perspectives π₁, π₂ appear.
A(π₁, π₂) ≠ 0 for the first time.

This CREATES the first accessible dimensions:
- V_{π₁} ∩ V_{π₂}: shared (symmetric) structure
- V_{π₁} △ V_{π₂}: difference (antisymmetric) structure

Nucleation = first antisymmetric step.
```

### 3.3 Expansion (Dimensions Accumulate)

```
Perspective chain: π₁ → π₂ → π₃ → ...

Each step with A(πᵢ, πᵢ₊₁) ≠ 0:
- Adds potential new directions
- Builds up accessible structure
- "Spacetime" grows through perspective sequences

The antisymmetric steps ARE time.
The accumulated structure IS space.
```

### 3.4 Black Hole (Dimensions Collapse)

```
In region B where γ → 0:

Perspectives barely overlap.
S(π₁, π₂) → 0 (nothing shared)
But A(π₁, π₂) → 0 also (no meaningful difference)

Both symmetric and antisymmetric structure vanish.
Dimensions "merge back" to orthogonality.
Recrystallization = antisymmetric collapse.
```

### 3.5 Return to Crystal

```
At singularity / heat death:

Var → 0
All A → 0
All S → trivial

Structure returns to pure potential.
The cycle completes.
```

---

## 4. Summary Table

| Phase | Var | A(π₁,π₂) | Dimensions | Physical |
|-------|-----|----------|------------|----------|
| Crystal | 0 | 0 | None accessible | Pre-nucleation |
| Nucleation | >0 | First ≠0 | Emerge | Big Bang |
| Expansion | >0 | Many ≠0 | Accumulate | Universe grows |
| Black hole | →0 | →0 | Collapse | Recrystallization |
| Crystal | 0 | 0 | None | Cycle complete |

---

## 5. Implications

### 5.1 Why Fermions Are Visible

Fermions are antisymmetric modes. By Theorem D.1, they CANNOT self-reference.

```
Antisymmetric mode m: A_m(π, π) = 0

To exist non-trivially, m REQUIRES two different perspectives.
This forces m to be "visible" — hidden would mean A = 0.
Fermions are locked into visibility by their antisymmetric nature.
```

This explains the observation: fermions 74% visible, scalars 7% visible.

### 5.2 Time as Antisymmetric Steps

From Axiom T1: Time = perspective sequences.

Now: Each temporal step with A(πᵢ, πᵢ₊₁) ≠ 0 creates structure.

```
Time isn't just ordering — it's dimension-building.
Each moment adds accessible directions.
The arrow of time = direction of antisymmetric accumulation.
```

### 5.3 Why Black Holes Are "Exits"

Black holes are where A → 0 for all perspective pairs.

```
No antisymmetric comparison = no dimension creation.
No dimension creation = no time.
No time = crystalline stasis.

Black hole interior = exit from perspectival existence.
```

---

## 6. Open Questions

| Question | Status |
|----------|--------|
| Exact form of A(π₁, π₂)? | OPEN — need to define f |
| Rate of dimension accumulation? | OPEN — dynamics not derived |
| What determines which dimensions emerge? | OPEN — may be contingent |
| Is this reversible (dimensions can collapse)? | PARTIAL — black holes suggest yes |

---

## 7. Verification Needed

1. Formalize the directed comparison f(π₁, π₂)
2. Show dimension count grows with chain length
3. Connect to existing γ formulas
4. Check consistency with black hole entropy

---

## 8. References

- `core/05_overlap.md` — γ definition
- `core/13_crystallinity.md` — Var, orthogonality
- `core/15_nucleation.md` — defect emergence
- `physics/black_holes.md` — recrystallization

---

*This document unifies nucleation, expansion, and collapse as one story of dimension dynamics driven by antisymmetric comparison.*
