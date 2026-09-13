# DEF_0216 Definition: Perspective Space

**Tag**: 0216
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/02_perspective.md

---

## Requires

- [DEF_0202: Points P]
- [DEF_0210: Perspective π]

## Provides

- Π: The space of all perspectives

---

## Statement

**Π** (Perspective Space)

```
Π = { π = (p, D, A) : p ∈ P, D valid, A consistent }
```

The set of all valid perspectives on U.

**Counting**:
```
|Π| ≤ |P| × 2^|directions| × |access_maps|
```

Finite by AXM_0100 (Finiteness).

---

## Notes

Π is the configuration space for perspectives.
The exact size depends on constraints from other axioms.
