# THM_04A1: Crystal Orthogonal Decomposition (Dark Sector)

**Status**: SKETCH
**Layer**: 1
**Created**: Session 95, formalized Session 144

---

## Statement

[DERIVATION] Partiality (AXM_0104) forces an orthogonal decomposition of the crystal:

```
V_Crystal = V_pi (+) V_pi^perp

where:
- V_pi = im(pi) is the visible (accessible) sector
- V_pi^perp is the hidden (dark) sector
- (+) denotes orthogonal direct sum
```

[CONJECTURE] The interface between visible and hidden sectors has dim = n_d^2 + n_c^2 = 137 degrees of freedom. [The DOF counting is [D] arithmetic; identifying 137 with 1/α is [A-PHYSICAL]]

## Proof Sketch

### Given
- AXM_0104 (P1): Partiality — im(pi) is a proper subspace of V_Crystal
- AXM_0110: Perfect orthogonality in crystal
- AXM_0111: Crystal completeness

### Derivation (Layer 1 — Pure Mathematics)
1. P1: im(pi) ⊊ V_Crystal (strict containment — perspective does not see everything)
2. AXM_0110: Crystal has well-defined orthogonality structure
3. AXM_0111: V_Crystal is complete
4. By orthogonal complement theorem [I-MATH: standard linear algebra]: V_Crystal = V_pi (+) V_pi^perp

> **Note**: Step 4 is the standard orthogonal complement theorem from linear algebra. Any inner product space decomposes as W ⊕ W^⊥ when W is a closed subspace. This is [I-MATH], not a novel result.

### [LAYER 2/3 CORRESPONDENCE] — Physical Interpretation

> Physical interpretation below requires Layer 2 correspondence rules. The core mathematical result (V_Crystal = V_pi ⊕ V_pi^perp) is Layer 1; all identifications with physics are Layer 2/3.

5. [LAYER 2] V_pi = visible sector, V_pi^perp = hidden sector [A-PHYSICAL: identifying mathematical subspaces with observable/dark sectors]
6. [LAYER 2] Channel counting: n_d^2 + n_c^2 = 16 + 121 = 137 interface degrees of freedom [A-PHYSICAL: identifying dimension count with 1/α]

**Gap**: The identification of 137 = n_d^2 + n_c^2 with the fine structure constant is [A-PHYSICAL], not derived from axioms. The arithmetic 4^2 + 11^2 = 137 is Layer 1; interpreting this as 1/α is Layer 2/3.

## Verification

**Script**: `verification/sympy/observable_fraction_analysis.py` — PASS

## Implications

> **[LAYER 2/3 CORRESPONDENCE]**: All implications below require Layer 2 correspondence rules. Physical interpretation requires identifying mathematical subspace dimensions with physical observables.

- [LAYER 3] [CONJECTURE] Dark matter and dark energy are structural consequences of partiality [A-PHYSICAL]
- [LAYER 3] [CONJECTURE] Visible fraction: 58/137 channels (SM), hidden fraction: 79/137 channels [A-PHYSICAL: channel counting identification]
- [LAYER 3] [CONJECTURE] Hidden sector gauge structure: SU(7) x U(1)_dark (from the 79 hidden channels) [A-PHYSICAL: gauge group identification]
- [LAYER 3] [CONJECTURE] Dark matter mass m_DM = (49/9) m_p = 5.11 GeV follows from channel counting [A-PHYSICAL: mass formula identification]

## Source

`framework/investigations/dark_matter/DARK_SECTOR_AND_GEOMETRY_CONSOLIDATED.md` (Sections 2-3)
