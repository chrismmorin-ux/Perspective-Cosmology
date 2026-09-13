# THM_04A6: Spin-Statistics Connection

**Status**: SKETCH (CASCADE from THM_0487)
**Layer**: 1/2
**Created**: Session 181 (formalization from physics checklist F7)

---

## Requires

- [THM_0487: SO(11) Breaking Chain] — spacetime is 3+1 dimensional
- [THM_0491: Hilbert Space Structure] — quantum states live in complex Hilbert space
- [THM_0485: F = C] — complex structure from directed time
- [I-MATH] Lorentz group representation theory
- [I-MATH] Spin-statistics theorem (Pauli 1940, Fierz 1939, Lueders-Zumino 1958)

## Provides

- Integer spin particles obey Bose-Einstein statistics (commuting fields)
- Half-integer spin particles obey Fermi-Dirac statistics (anticommuting fields)
- Pauli exclusion principle for fermions
- Bosonic bunching for integer-spin particles

---

## Statement

**Theorem (Spin-Statistics Connection)**

```
Given:
  (i)   Spacetime is 3+1 dimensional [D: THM_0487, Stage 1]
  (ii)  The Lorentz group is SO(3,1) [D: from (i)]
  (iii) Physical states form a complex Hilbert space [D: THM_0491]
  (iv)  Locality: spacelike-separated observables commute [A-PHYSICAL]
  (v)   Energy is bounded below [A-PHYSICAL]

Then:
  Fields of integer spin must satisfy [phi(x), phi(y)] = 0 for (x-y)^2 < 0
  Fields of half-integer spin must satisfy {psi(x), psi(y)} = 0 for (x-y)^2 < 0

Equivalently: integer spin <-> bosonic statistics, half-integer spin <-> fermionic statistics.
```

---

## Derivation Chain

### What the framework derives

**Step 1** [D: THM_0487]: The SO(11) breaking chain yields SO(4) x SO(7), where SO(4) is the spacetime factor. With Lorentzian signature selection [A-PHYSICAL: metric signature], this gives SO(3,1) — the Lorentz group.

**Step 2** [I-MATH]: The connected component of SO(3,1) has universal cover SL(2,C). Finite-dimensional representations of SL(2,C) are labeled by (j_L, j_R) with j_L, j_R in {0, 1/2, 1, 3/2, ...}. The spin is j = j_L + j_R.

**Step 3** [I-MATH: Pauli 1940]: The spin-statistics theorem proves that in any Lorentz-invariant quantum field theory with locality and positive energy:
- Fields in integer-spin representations must be quantized with commutation relations (bosons)
- Fields in half-integer-spin representations must be quantized with anticommutation relations (fermions)

### What the framework provides as context

**Quaternion connection**: SU(2) = Sp(1) = unit quaternions [I-MATH]. The framework derives SU(2) as part of the gauge structure (from Aut(H) under F = C constraint, THM_0484). The fundamental representation of SU(2) is a 2-component spinor, which transforms under 2pi rotation as psi -> -psi (the hallmark of half-integer spin).

**Fermion identification**: The framework identifies 15 fermions per generation from division algebra dimensions (1 + 2 + 4 + 8 = 15, from R + C + H + O channels). These are placed in spinor representations of the gauge group. [DERIVATION level — see fermion_multiplets_from_division_algebras.md]

**Chirality from F = C**: THM_0485 selects complex structure, which provides the handedness needed for chiral fermions (left-handed doublets, right-handed singlets under SU(2)_weak).

---

## Proof Status

This is a **CASCADE** result, not a novel derivation:

| Component | Status | Source |
|-----------|--------|--------|
| 3+1D spacetime | [D] SKETCH | THM_0487 |
| Lorentz group exists | [D] follows from 3+1D | THM_0487 |
| Spin representations exist | [I-MATH] | Wigner classification |
| Spin-statistics connection | [I-MATH] | Pauli 1940 |
| Fermion identification | [D] DERIVATION | Division algebra counting |
| Chirality mechanism | [D] DERIVATION | THM_0485 (F = C) |

**What the framework does NOT provide**:
- A novel proof of spin-statistics from axioms alone
- A derivation of WHY integer spin → commutation (beyond the standard QFT argument)
- Anticommutation relations from first principles
- Second quantization formalism from perspective axioms

---

## Identified Gaps

| Gap | Status | Description |
|-----|--------|-------------|
| G-SST-1 | NOTED | Metric signature (Lorentzian vs Euclidean) is [A-PHYSICAL], not derived |
| G-SST-2 | NOTED | Locality assumption (iv) is [A-PHYSICAL], not fully derived from axioms |
| G-SST-3 | NOTED | Positive energy (v) is [A-PHYSICAL]; THM_0450 gives norm conservation but not energy positivity |
| G-SST-4 | OPEN | Deeper question: does division algebra non-commutativity directly force anticommutation? |

---

## Open Question (G-SST-4)

There is an intriguing structural parallel:

```
Quaternions H:     non-commutative (ab != ba)
Fermionic fields:  anticommuting (psi_a * psi_b = -psi_b * psi_a)
```

If the framework's quaternionic structure directly enforces fermionic anticommutation, this would be a genuine derivation rather than a cascade. This remains **[SPECULATION]** — no proof exists, and the connection may be superficial.

---

## Dependencies

| Dependency | Type | Role |
|-----------|------|------|
| THM_0487 | [D] | Provides 3+1D spacetime |
| THM_0491 | [D] | Provides Hilbert space for QM |
| THM_0485 | [D] | Provides chirality (F = C) |
| Lorentz group rep theory | [I-MATH] | Spin quantum numbers |
| Spin-statistics theorem | [I-MATH] | The core result (Pauli 1940) |
| Metric signature | [A-PHYSICAL] | Lorentzian, not Euclidean |
| Locality | [A-PHYSICAL] | Microcausality assumption |
| Positive energy | [A-PHYSICAL] | Energy bounded below |

---

## Verification

No novel numerical content to verify. The spin-statistics theorem is a standard [I-MATH] result that applies once the prerequisites (3+1D, Lorentz invariance, locality, positive energy) are established.

---

## Checklist Reference

Maps to: **F7 (Spin-Statistics Theorem)** in PHYSICS_CHECKLIST.md
Previous status: OPEN
New status: **CASCADE** (follows from 3+1D spacetime derivation + standard QFT)
