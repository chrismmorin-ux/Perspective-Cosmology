# DEF_02B3 Definition: Interface Mode Count and Interface Strength

**Tag**: 02B3
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: alpha_forced_vs_fitted smaller-steps (define interface strength in framework terms only)
**Added**: 2026-01-30

---

## Requires

- [DEF_0286: Defect]
- [DEF_0285: Crystalline]
- [DEF_02A3: Tilt Matrix]
- [THM_0485: Complex Structure (F = C)] — crystal as complex inner product space
- Dimension counts n_d (defect), n_c (crystal) from [THM_0484] / [AXM_0109], [AXM_0118]

## Provides

- Interface mode count N_I (dimensionless integer)
- Interface strength s_I (dimensionless number in (0, 1])
- No identification with any physical constant

---

## Statement

**Interface**

The **defect–crystal interface** is the boundary between the perspectival defect (Var > 0) and the crystal (Var = 0): the locus where tilt ε is defined and where a single perspective compares defect structure to crystal structure (see [DEF_02A3], [DEF_02B0]).

**Interface mode count**

In one defect–crystal comparison, the number of independent degrees of freedom that participate is the dimension of the space of tilt/symmetry generators at the interface. When the crystal is a complex inner product space (F = C, [THM_0485]), the relevant symmetry group is U(n_d) × U(n_c). The Lie algebra has dimension:

```
N_I = n_d² + n_c²
```

We call **N_I** the **interface mode count**: the number of independent modes in a single defect–crystal comparison.

**Interface strength**

The **interface strength** is the reciprocal of the interface mode count:

```
s_I = 1 / N_I = 1 / (n_d² + n_c²)
```

s_I is a dimensionless number in (0, 1]. It is the unique natural dimensionless "strength" parameter from the framework for the defect–crystal interface (one number per comparison, no free parameters).

---

## Values (from framework dimensions)

With n_d = 4 and n_c = 11 [D: THM_0484, AXM_0118]:

```
N_I = 4² + 11² = 16 + 121 = 137
s_I = 1/137
```

---

## Dimensional compatibility

- **N_I** is a count (dimensionless integer). **s_I** = 1/N_I is a dimensionless number in (0, 1].
- In QED, the fine structure constant α = e²/(4πε₀ℏc) is dimensionless. Equating a dimensionless framework quantity (s_I or 1/N_I) with a dimensionless physical coupling (α or 1/α) is at least **dimensionally consistent**. This does not prove equality; it only shows that such an identification is not ruled out by dimensions.

---

## Uniqueness (single natural number)

The tilt / U(n_d) × U(n_c) construction yields **exactly one** natural dimensionless integer from the Lie algebra dimension: N_I = n_d² + n_c². No other combination of n_d, n_c arises as "number of interface modes" from the same symmetry argument:
- The dimension of u(n) is n² (number of generators). So the total generator count at the defect–crystal interface is n_d² + n_c².
- Alternatives such as n_d + n_c, n_d·n_c, or n_d² − n_c² do not count "modes in one comparison" in this construction; they are not the dimension of the Lie algebra of the interface symmetry group.
- So the framework supplies a single candidate dimensionless integer (137) that could later be identified with 1/α, reducing the "why this number?" objection.

---

## Layer 0 purity

- **No physical constant**: This definition does not identify N_I or s_I with 1/α, e²/(4πε₀ℏc), or any measured coupling. Any such identification is a separate correspondence (alpha derivation chain Step 5).
- **Framework only**: N_I and s_I are defined from defect dimension n_d, crystal dimension n_c, and F = C (from time). No observation or Standard Model input is used.

---

## Notes

- The same count arises as the number of generators of U(n_d) ⊕ U(n_c): each generator is one "channel" or mode at the interface.
- For the real case F = R, the symmetry group would be O(n_d) × O(n_c) and the generator count would be n_d(n_d−1)/2 + n_c(n_c−1)/2 = 61; that case is ruled out by [THM_0485] (time requires F = C).
- **Purpose**: To have one clear, framework-only dimensionless quantity (N_I or s_I) that could later be compared to physical constants. The definition does not assert that s_I equals any particular coupling.

---

## Cross-References

- [THM_0485: Complex Structure] — F = C from time; U(n) not O(n)
- [core/17_complex_structure.md] — generator count 137 (not 61)
- [framework/investigations/alpha/alpha_forced_vs_fitted.md] — Step 5: identification of N_I or s_I with 1/α is conjectural
