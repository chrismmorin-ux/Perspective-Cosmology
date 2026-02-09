# THM_0421 Theorem: Adjacency Graph

**Tag**: 0421
**Type**: THEOREM
**Status**: CANONICAL (promoted from SKETCH — construction verified, Session 196)
**Source**: core/04_adjacency.md

---

## Requires

- [AXM_0100: Finiteness] — |Π| < ∞
- [DEF_0216: Perspective space Π] — the set of all valid perspectives
- [DEF_0225: Adjacency relation ~] — π₁ ~ π₂ iff U_{π₁} ∩ U_{π₂} ≠ ∅
- [DEF_0227: Information loss ΔI] — ΔI(π₁ → π₂) = dim(U_{π₁}) - dim(U_{π₂})
- [AXM_0107: Non-negative loss] — valid transitions require ΔI ≥ 0

## Provides

- G = (Π, E) is a finite directed graph
- E is well-defined from ~, ΔI, and AXM_0107

---

## Statement

**Theorem Adj.2 (Adjacency Graph)**

```
The pair G = (Π, E) where

    E = { (π₁, π₂) ∈ Π × Π : π₁ ~ π₂  and  ΔI(π₁ → π₂) ≥ 0 }

is a finite directed graph.
```

The directed edge π₁ → π₂ exists when π₁ and π₂ share accessible content and the transition does not decrease accessible information.

---

## Proof

A **directed graph** is a pair (V, E) where V is a set and E ⊆ V × V. [I-MATH: definition]

### Step 1: Vertex set is well-defined and finite

Π is a well-defined finite set. [DEF_0216, AXM_0100]

### Step 2: Edge relation is well-defined

For any pair (π₁, π₂) ∈ Π × Π, both conditions in the definition of E are decidable:

(a) **Adjacency**: π₁ ~ π₂ iff U_{π₁} ∩ U_{π₂} ≠ ∅. The sets U_{π₁}, U_{π₂} are determined by the perspectives (DEF_0214), and their intersection is computable since V is finite-dimensional [AXM_0100]. This is a well-defined predicate. [DEF_0225]

(b) **Non-negative loss**: ΔI(π₁ → π₂) = dim(U_{π₁}) - dim(U_{π₂}). Both dimensions are finite non-negative integers [AXM_0100], so ΔI is a well-defined integer, and ΔI ≥ 0 is decidable. [DEF_0227]

Therefore E ⊆ Π × Π is a well-defined set. [Set-builder with decidable predicates on finite domain]

### Step 3: Conclusion

(Π, E) is a finite set equipped with a binary relation E ⊆ Π × Π. This is a finite directed graph by definition. [I-MATH] □

---

## Verification

**Script**: `verification/sympy/adjacency_graph_aut_decomposition_proof.py`
**Status**: PASS (graph construction verified on concrete examples)

---

## Properties of the directed graph

The following properties are **not** part of this theorem but are established elsewhere:

| Property | Status | Reference |
|----------|--------|-----------|
| No temporal loops | CANONICAL | THM_0461 |
| Connected (when Σ connected) | Follows from AXM_0101 | Not yet formalized |
| Anti-reflexive (π cannot transition to itself) | Follows from THM_0410 | Not yet formalized |

---

## Remark on theorem status

The construction of a directed graph from a finite set and a binary relation is definitional. The substantive content of THM_0421 is that the specific construction (using ~ from DEF_0225 and ΔI from DEF_0227, filtered by AXM_0107) produces a well-defined graph with physically meaningful structure. The non-trivial properties of this graph (acyclicity, horizon structure) are proven in subsequent theorems.

---

## Notes

The directed edges represent valid perspective transitions. Time flows along the direction of the arrows — from perspectives with more accessible content to those with less (or equal), per AXM_0107.

The direction function partitions each undirected edge π₁ ~ π₂ into:
- **Forward only** (π₁ → π₂): when dim(U_{π₁}) > dim(U_{π₂}), so ΔI(π₁→π₂) > 0 and ΔI(π₂→π₁) < 0
- **Bidirectional** (π₁ ↔ π₂): when dim(U_{π₁}) = dim(U_{π₂}), so ΔI = 0 in both directions
- **No valid edge removed**: since ΔI is anti-symmetric (ΔI(π₁→π₂) = −ΔI(π₂→π₁)), at least one direction always has ΔI ≥ 0. "Deleted edges" (ΔI < 0 in both directions) are impossible.

---

## History

- Original: Statement without proof section
- Session 140: Downgraded CANONICAL → SKETCH (no proof)
- Session 196: Proof of well-definedness. Promoted SKETCH → CANONICAL. Added remark on definitional nature.
- Session 196 (later): Updated for DEF_0227 correction (ΔI = net dimension change). Notes section corrected — anti-symmetry of ΔI replaces old sum argument.
