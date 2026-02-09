# [13] Crystallinity and Defects

**Status**: CANONICAL
**Confidence**: [AXIOM] — defines crystalline structure and defects
**Dependencies**: 00_notation, 11_perspective_space
**Verified**: N/A (definitions)

---

REQUIRES: 00_notation, 11_perspective_space
DEFINES: crystalline, defect, nucleation
CONTENT-TYPE: DEFINITION + THEOREM

## Connections

**Forward** (modules that use this):
- 15_nucleation (embedding hypothesis), physics/alpha_crystal_interface

**Backward** (modules this uses):
- 00_notation, 11_perspective_space

---

## Crystalline Limit

U is **crystalline** iff:

```
Var(U) = 0

⟺ ∀ π₁, π₂ ∈ Π : U_{π₁} ≅ U_{π₂}
```

All perspectives reveal isomorphic content.

---

## Experiential Inertness

**Theorem C.1**
```
If Var(U) = 0, all temporal sequences are experientially equivalent.
```

"Time passes" but nothing distinguishes moments.

---

## Perspectival Defect

A **defect** is a region R ⊂ U where:

```
Var(R) > 0  while  Var(U \ R) ≈ 0
```

Defects break the symmetry that makes crystals "dead."

---

## Defects are Necessary

```
Experience requires Var > 0.
Crystalline structure is experientially inert.
Defects enable distinction, change, time.
```

---

## Embedding Hypothesis

U may exist as a defect within larger crystalline structure:

```
Let C be crystalline: Var(C) = 0
Let U ⊂ C with Var(U) > 0

U is a localized symmetry breaking in C.
```

Analogous to:
- Dislocations in physical crystals
- Phase transitions (ordered → disordered)
- Nucleation sites

---

## Nucleation

A **nucleation point** n ∈ C is where:

```
- Local structure admits non-trivial perspective
- Var(neighborhood of n) > 0
- Adjacent crystalline structure perturbed
```

Once perspective exists at n:
- Adjacent perspectives become possible
- Adjacency chains can form
- Experience becomes possible

---

## Self-Propagation

```
If π exists at p, and p' is Γ-adjacent to p,
then π' at p' is structurally possible.
```

Perspective doesn't "spread" in time. It exists wherever structure permits.
