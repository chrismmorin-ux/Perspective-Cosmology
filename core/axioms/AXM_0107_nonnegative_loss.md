# AXM_0107 Axiom: Non-Negative Loss

**Tag**: 0107
**Type**: AXIOM
**Status**: CANONICAL
**Source**: core/04_adjacency.md
**Updated**: Session 196 (DEF_0227 corrected — axiom now non-tautological)

---

## Requires

- [DEF_0225: Adjacency relation ~]
- [DEF_0227: Information loss ΔI] — ΔI(π₁ → π₂) = dim(U_{π₁}) - dim(U_{π₂})

## Provides

- Valid transitions have non-negative information loss

---

## Statement

**Axiom Adj.1 (Non-Negative Loss)**

```
Valid adjacency π₁ ~ π₂ requires ΔI(π₁ → π₂) ≥ 0
```

This defines a direction on adjacency: "time" flows toward non-decreasing hidden content.

---

## Notes

This axiom is the source of time's arrow in the framework.
It ensures transitions cannot spontaneously decrease hidden content.

---

## Conflict C-003 Resolution (S72 + S182)

**Conflict**: AXM_0107 (ΔI ≥ 0 for valid transitions) appears to contradict AXM_0115 (transition algebra contains inverses, i.e., reverse transitions exist).

**Resolution**: The transition algebra 𝒯 (AXM_0115) contains ALL mathematically consistent transitions, including reverses. AXM_0107 selects the **physical subset** where ΔI ≥ 0. Physical time is a path through 𝒯 constrained by non-negative loss; the algebra itself is unconstrained.

Analogy: The Lorentz group contains time reversal; physics selects the future light cone.

See AXM_0115 "Physical Time vs Mathematical Algebra" section for the complementary discussion.

---

## Assumption Classification (Session 189 Audit)

| Component | Classification | Notes |
|-----------|---------------|-------|
| ΔI(π₁ → π₂) ≥ 0 for valid adjacency | [A-AXIOM] | Layer 1 assumption defining physical time direction |

**Honest assessment**: This axiom imports the concept of "valid adjacency" (physical time) as distinct from mathematical adjacency. It is the framework's version of the second law — an irreversibility postulate that cannot be derived from the symmetric Layer 0 axioms.

**Session 196 erratum**: The original DEF_0227 defined ΔI as the overlap loss dim(U_{π₁}) - dim(U_{π₁} ∩ U_{π₂}), which is always ≥ 0 for any pair of subspaces. This made AXM_0107 tautological (vacuous). DEF_0227 has been corrected to ΔI = dim(U_{π₁}) - dim(U_{π₂}) (net dimension change), which can be negative. AXM_0107 is now a genuine constraint: accessible dimension is non-increasing along valid transitions.

---

## Cross-References

- [AXM_0115: Algebraic Completeness] — contains all transitions; AXM_0107 selects the physical subset (Conflict C-003)
- [AXM_0116: Crystal Timelessness] — crystal has no time; AXM_0107 applies only to non-crystal perspectives
- [AXM_0117: Crystallization Tendency] — both are "second law" style irreversible tendencies
- [THM_0420: Irreversibility] — derives irreversibility from this axiom
- [THM_0451: Second Law] — entropy increase follows from ΔI ≥ 0
