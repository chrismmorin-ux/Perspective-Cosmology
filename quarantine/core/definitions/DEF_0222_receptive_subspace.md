# DEF_0222 Definition: Receptive Subspace

**Tag**: 0222
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/03_propagation.md

---

## Requires

- [DEF_0202: Points P]
- [DEF_0205: Value space V]

## Provides

- V_p: Receptive subspace at point p
- Π_p: Projection onto V_p

---

## Statement

At each point p:

**V_p ⊆ V** (Receptive Subspace)
- Which dimensions p can distinguish
- dim(V_p) ≤ dim(V)

**Π_p: V → V_p** (Projection)
- Orthogonal projection onto V_p

---

## Notes

The receptive subspace determines what a perspective at p can "see".
Dimensions orthogonal to V_p are invisible from that point.
