# SO(11) Breaking Stages as Cosmological Epochs

**Status**: DERIVATION
**Created**: Session 189, 2026-02-02
**Last Updated**: Session 189, 2026-02-02

---

## Plain Language

The framework claims the universe began as a highly symmetric structure described by the group SO(11) — the rotations of an 11-dimensional crystal. This symmetry didn't break all at once. It broke in four stages, each releasing a burst of "Goldstone" modes (the universe's way of recording which symmetry was lost).

Think of it like ice crystallizing from water in stages. First the bulk freezes (Stage 1 — inflation), then the crystal structure refines (Stages 2 and 3 — color and flavor symmetries emerge), and finally the last delicate ordering happens (Stage 4 — electroweak symmetry breaking, creating massive W and Z bosons).

The CMB is the fossil record of Stage 1. The 28 Goldstone bosons released during the first break are the microscopic degrees of freedom that seeded the temperature fluctuations we observe today.

**One-sentence version**: The four stages of SO(11) crystallization map to four cosmological epochs, with the CMB encoding Stage 1's 28 Goldstone modes.

---

## Question

How does the SO(11) → SM breaking chain map to cosmological history, and what happens to all 43 Goldstone bosons?

## The Breaking Chain

```
SO(11) → SO(4)×SO(7) → SO(4)×G₂ → SO(4)×SU(3) → U(2)×SU(3)
         Stage 1         Stage 2      Stage 3        Stage 4
         28 Gold.        7 Gold.      6 Gold.        2 Gold.
```

## Goldstone Counting by Stage

| Stage | Breaking | Goldstones | Expression | Coset |
|-------|----------|-----------|------------|-------|
| 1 | SO(11) → SO(4)×SO(7) | 28 | n_d × Im_O | — |
| 2 | SO(7) → G₂ | 7 | Im_O | S⁷ |
| 3 | G₂ → SU(3) | 6 | Im_O - 1 | S⁶ |
| 4 | SO(4) → U(2) | 2 | C | S² |
| **Total** | | **43** | dim(SO(11)) - dim(SM) | |

Check: 55 - 12 = 43 [VERIFIED]

The Stages 1-3 subtotal = 41 = 194 - 153 (Goldstone-Denominator identity, THM_0489).

**Derivation chain**:
- 28 = n_d × Im_O [D: from (4,7) split of SO(11)]
- 7 = dim(SO(7)/G₂) [D: from G₂ = Aut(O), THM_0487 Stage 2]
- 6 = dim(G₂/SU(3)) [D: from F=C selection, THM_0485]
- 2 = dim(SO(4)/U(2)) [D: from F=C breaking SU(2)_R → U(1)_Y]
- 12 = dim(SM) = n_c + 1 [D: from n_c = 11]

## Goldstone Fate Tracking

### Stage 1: 28 Goldstones

The (4,7) off-diagonal block of the order parameter. Under SM:

| Fate | DOF | Framework | Status |
|------|-----|-----------|--------|
| Higgs doublet | 4 = n_d | SU(2)_L singlet fraction 1/Im_O | [DERIVATION] |
| → 3 eaten (W⁺,W⁻,Z) | 3 | Longitudinal polarizations | [DERIVATION] |
| → 1 physical Higgs | 1 | 125 GeV scalar | [DERIVATION] |
| Colored scalars | 24 | Massive at ~ f scale | [CONJECTURE] |

Singlet fraction: 4/28 = 1/7 = 1/Im_O [D: from SU(3)_c decomposition of (4,7)]

### Stage 2: 7 Goldstones

SO(7)/G₂ coset. Under SU(3): **3 + 3̄ + 1** [D: standard branching rule]

All 7 become massive at the G₂-breaking scale. Not observed as light particles.

### Stage 3: 6 Goldstones

G₂/SU(3) coset. Under SU(3): **3 + 3̄** [D: standard branching rule]

All 6 become massive. These carry color charge — if light, would form exotic hadrons.

### Stage 4: 2 Goldstones

SO(4)/U(2) coset. Absorbed into gauge structure when SU(2)_R → U(1)_Y.

### Full DOF Accounting

| Category | DOF | Notes |
|----------|-----|-------|
| SM gauge generators | 12 | SU(3)×SU(2)×U(1) |
| Physical Higgs | 1 | 125 GeV |
| Eaten (W⁺,W⁻,Z) | 3 | Longitudinal modes |
| Frozen Goldstones | 39 | Massive, not observed |
| **Total** | **55** | = dim(SO(11)) |

## Energy Scale Mapping

| Stage | Energy | Source | Epoch |
|-------|--------|--------|-------|
| 1 | ~ 2×10¹⁶ GeV | m_tilt [A-PHYSICAL] | Inflation |
| 2 | ~ 10¹⁴-10¹⁶ GeV | [GAP - not derived] | Post-inflation |
| 3 | ~ 10¹²-10¹⁶ GeV | [GAP - not derived] | Color emergence |
| 4 | 246 GeV | v_EW [A-IMPORT] | EWSB |

**Gaps**: Stages 2-3 energy scales are NOT derived from the framework. The ordering (Stage 1 > Stage 2 > Stage 3 > Stage 4) is natural from the hierarchy of subgroups, but the actual scales require dynamical calculations not yet performed.

## CMB Connection

The CMB directly encodes Stage 1:

| Observable | Framework Value | Origin |
|-----------|----------------|--------|
| n_s | 193/200 = 0.965 | Hilltop slow-roll with μ² = 1536/7 |
| r | 7/200 = 0.035 | r = 1 - n_s from η/ε = -5 |
| N | ~ 52 e-folds | From μ² value |
| A_s | [GAP - V₀ not derived] | Requires V₀ |

The 28 Stage-1 Goldstones are the field-theoretic DOF whose quantum fluctuations generate the primordial power spectrum.

## Open Questions

1. **Stage 2-3 energy scales**: Can these be derived from the crystallization potential?
2. **Colored scalar masses**: What sets the mass of the 24 colored pNGB scalars?
3. **N_eff from Goldstones**: Do the 28 Stage-1 modes contribute to effective neutrino species?
4. **Reheating**: How does the transition from Stage 1 to Stage 2 proceed?
5. **Stage ordering**: Is the hierarchy Stage 1 → 2 → 3 → 4 dynamically forced, or just assumed?

## Dependencies

- Uses: THM_0487 (breaking chain), THM_0485 (F=C), THM_0489 (Goldstone-Denominator), AXM_0117 (crystallization)
- Used by: CMB interpretation (Task 4), inflationary amplitude (Task 3)

## Verification

**Script**: `verification/sympy/so11_epoch_dof_counting.py` — 28/28 PASS

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 189 | Full epoch mapping + DOF tracking | All 43 Goldstones mapped. Stages 2-3 scales = GAP. |
