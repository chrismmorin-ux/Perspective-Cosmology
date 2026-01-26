# DEF_0226 Definition: Transition Map

**Tag**: 0226
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/04_adjacency.md

---

## Requires

- [DEF_0213: Access map A]
- [DEF_0225: Adjacency relation ~]

## Provides

- T_{12}: Transition map between perspectives

---

## Statement

For adjacent π₁ ~ π₂:

**T_{12}: U_{π₁} → U_{π₂}**

```
T_{12}(x) = A_{π₂}(A_{π₁}^{-1}(x))
```

Where A_{π₁}^{-1} selects a preimage.

---

## Notes

The transition map is how information transforms between perspectives.
The choice of preimage introduces non-determinism (multiple preimages exist by AXM_0106).
