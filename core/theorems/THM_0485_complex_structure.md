# THM_0485 Theorem: Complex Structure (F = C)

**Tag**: 0485
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/17_complex_structure.md
**Derived**: Session 44
**Added**: Session 72 (formalization)

---

## Requires

- Directed time (T1 implies time has direction)
- [AXM_0107: Non-Negative Loss] — gives time direction

## Provides

- The field F must be C (complex numbers)
- Foundation for quantum phase, unitarity, fermions

---

## Statement

**Theorem (Complex Structure)**

```
Directed time requires the field F = C (complex numbers).

Real inner products are symmetric: ⟨a,b⟩ = ⟨b,a⟩
Complex inner products have antisymmetric imaginary part:
    ⟨a,b⟩ = ⟨b,a⟩* with Im⟨a,b⟩ = -Im⟨b,a⟩

Directed time ("a then b" ≠ "b then a") requires antisymmetric structure.
Therefore F = C.
```

---

## Proof

1. **Time has direction**: From AXM_0107 (ΔI ≥ 0), transitions are directed
   - "a then b" is different from "b then a"
   - This requires mathematical structure that distinguishes order

2. **Real inner products are symmetric**:
   - ⟨a,b⟩ = ⟨b,a⟩ (for real inner products)
   - Cannot encode directional information

3. **Complex inner products have antisymmetric part**:
   - ⟨a,b⟩ = ⟨b,a⟩* (conjugate symmetry)
   - Split: ⟨a,b⟩ = Re⟨a,b⟩ + i·Im⟨a,b⟩
   - Real part: symmetric
   - Imaginary part: antisymmetric (Im⟨a,b⟩ = -Im⟨b,a⟩)

4. **Directed time requires antisymmetric structure**:
   - Only F = C provides this
   - Therefore the framework requires complex structure

QED

---

## Consequences

| Consequence | Derivation |
|-------------|------------|
| U(n) groups | Complex structure → unitary transformations |
| Quantum phase | Complex amplitudes |
| Fermion antisymmetry | Imaginary part of inner product |
| Interference | Phase relationships |

---

## Verification

- Logical argument in core/17_complex_structure.md
- Mathematical fact: only complex inner products have antisymmetric part

---

## Cross-References

- [AXM_0116: Crystal is Timeless (T1)]
- [AXM_0107: Non-Negative Loss]
- [THM_0484: Division Algebra Structure]
- [core/17_complex_structure.md]
