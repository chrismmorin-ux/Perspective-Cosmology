# Dimension-Observable Correspondence

**Status**: CANONICAL (verified, updated with S132a-S135 results)
**Confidence**: [CONJECTURE] — pattern is verified across 20+ formulas; physical reason remains interpretive
**Created**: Session 125
**Formalized**: Session 136
**Last Updated**: Session 136

---

## Plain Language

When you look at the framework's formulas for different cosmological observables, a striking pattern emerges: the formulas naturally sort themselves by which division algebra dimension appears most prominently.

Formulas about how fast the universe expands (Hubble constant, sound horizon, conformal time) are all built from Im_H = 3 and H = 4 — the quaternionic dimensions. Formulas about oscillation patterns (CMB acoustic peaks, spectral index, fine structure constant) are all built from n_c = 11 — the crystal dimension. And formulas about cosmic inventory (how much dark energy, matter, baryons) are built from Im_O = 7 and O = 8 — the octonionic dimensions.

This suggests a physical interpretation: quaternions govern spacetime expansion (rotations and boosts), the crystal structure governs standing wave patterns, and octonions govern the dark sector and total inventories. The universe's algebraic structure determines which physics each algebra controls.

**One-sentence version**: Expansion uses quaternionic dimensions, oscillation uses the crystal dimension, and cosmic inventory uses octonionic dimensions.

---

## The Three Domains

### Domain 1: Expansion (H, Im_H)

**Algebra**: Quaternions (H = 4, Im_H = 3)
**Physics**: Rates, ages, horizons, sound speed

| Observable | Formula | Im_H/H Content |
|------------|---------|----------------|
| H_0 | 337/5 km/s/Mpc | 337 = Im_H^4 + H^4 |
| eta_* | 337 Mpc | Same fourth-power sum |
| c_s/c | Im_H/Im_O = 3/7 | Im_H in numerator |
| r_s | 337 * 3/7 Mpc | Both 337 and Im_H |
| Bridge H_0 | 4177/62 | 4177 = Im_H^4 + O^4 |

**Physical interpretation** [SPECULATION]: Quaternions describe rotations in 3D and boosts in 3+1D. The imaginary quaternions (Im_H = 3) encode spatial rotation generators. Expansion rates depend on how 3-space is stretching, naturally connecting to Im_H.

### Domain 2: Oscillation (n_c)

**Algebra**: Crystal structure (n_c = 11)
**Physics**: Peaks, wavelengths, standing waves, spectral properties

| Observable | Formula | n_c Content |
|------------|---------|-------------|
| l_A | 96*pi | 96 = O * (n_c + 1) |
| l_1 | C * n_c * (n_c - 1) = 220 | Direct n_c dependence |
| l_n | 96*pi*(n_c*n - Im_H)/n_c | Peak formula uses n_c |
| n_s | 193/200 | 200 = 2(n_c - 1)^2 |
| r | 7/200 | Same denominator |
| 1/alpha | 137 + 4/111 | 111 = n_c^2 - n_c + 1 |
| Phase | Im_H/n_c = 3/11 | n_c in denominator |

**Physical interpretation** [SPECULATION]: n_c = 11 is the crystal dimension — the total internal degrees of freedom. Standing waves and oscillation patterns are determined by the crystal's structure, making n_c the natural parameter for acoustic physics.

### Domain 3: Inventory (O, Im_O)

**Algebra**: Octonions (O = 8, Im_O = 7)
**Physics**: Density fractions, dark sector, total budgets

| Observable | Formula | O/Im_O Content |
|------------|---------|----------------|
| Omega_L | 63/91 = 9/13 | 63 = Im_O * Im_H^2, 91 = Im_O * 13 |
| Omega_m | 28/91 = 4/13 | 28 = H * Im_O |
| Omega_b | 567/11600 | 567 = Im_O * Im_H^4 |
| O^2 - k family | {63, 62, 61, 60, 57, 56} | All anchored by O^2 = 64 |
| Omega_L + Omega_m | 1 | Octonionic completion |

**Physical interpretation** [SPECULATION]: Octonions are the largest normed division algebra, encoding "completion" and "totality." The dark sector (dark energy, dark matter) is governed by octonionic structure because these are the "hidden" degrees of freedom not directly observed.

---

## Crossover Observables

Some quantities bridge two domains:

| Observable | Domains | Expression | Physics |
|------------|---------|-----------|---------|
| z_* = 1089 | Expansion + Oscillation | (Im_H * n_c)^2 = 33^2 | Recombination transition |
| c_s = 3/7 | Expansion + Inventory | Im_H / Im_O | Sound speed of baryon-photon fluid |
| 567 | Expansion + Inventory | Im_O * Im_H^4 | Baryon fraction |
| 96 | Oscillation + Inventory | O * (n_c + 1) | Acoustic angular scale |
| 193 | Oscillation + Inventory | 2(n_c-1)^2 - Im_O | Spectral index numerator |

**Note on z_***: Session 135 classified z_* = 33^2 = 1089 as NUMEROLOGICAL. Standard recombination physics with framework parameters gives z_* ~ 1092.2. The 33^2 match falls within recombination uncertainty and is not a fundamental framework prediction.

---

## Inter-Domain Bridge Formulas

These quantities connect two algebraic domains, revealing cross-structure:

1. **Sound speed**: c_s = Im_H/Im_O = 3/7
   - Expansion (Im_H) meets Inventory (Im_O)
   - Physics: baryon-photon coupling spans both domains

2. **Baryon density numerator**: 567 = Im_O * Im_H^4
   - Inventory (Im_O) meets Expansion (Im_H^4)
   - Im_H^4 = 81 is the expansion signature entering inventory

3. **Acoustic scale**: 96 = O * (n_c + 1) = O * dim_SM
   - Inventory (O) meets Oscillation (n_c)
   - Angular projection links sky inventory to sound waves

4. **Spectral tilt**: 193 = 200 - Im_O = 2(n_c-1)^2 - Im_O
   - Oscillation (n_c) meets Inventory (Im_O)
   - Primordial spectrum connects crystal structure to octonionic sector

---

## Skeptical Assessment

### Strengths
- Pattern covers 20+ formulas across cosmology
- Domain assignments are CONSISTENT — no formula contradicts its domain
- Bridge quantities naturally combine dimensions from both relevant domains
- Verified by script: 22/22 tests PASS

### Weaknesses
- The framework has 7 basic quantities {1, 2, 3, 4, 7, 8, 11} covering most small integers
- Any formula using small numbers will factor into framework quantities
- Domain assignment is POST-HOC — observables were classified after formulas found
- No mechanism explains WHY quaternions govern expansion specifically
- Some observables use multiple domains (bridges), weakening the clean separation

### What Would Strengthen This
- A derivation from axioms showing WHY expansion formulas use Im_H
- A blind prediction: use the correspondence to predict a NEW formula's algebraic content before deriving it
- Finding a formula that VIOLATES the correspondence would be equally informative

---

## Verification

**Script**: `verification/sympy/dimension_observable_correspondence.py` — **22/22 PASS**

---

## Dependencies

- Uses: Division algebra dimensions R=1, C=2, H=4, O=8 [A-AXIOM]
- Uses: n_c = 11 [D: from THM_0484]
- Uses: All cosmological formulas from S94-S135 [D: various]
- Uses: z_* = 33^2 classification [D: S135, NUMEROLOGICAL]

## What Would Falsify This

1. A cosmological formula where Im_H appears in an inventory context or O appears in an expansion context, with no bridge explanation.
2. A systematic test showing random groupings of formulas produce equally clean domain separation.
3. A derivation showing the domain assignments are algebraically forced would CONFIRM this (not needed for falsification).

---

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 125 | Pattern discovered, initial script | Score 5 emerging pattern |
| 132a | Acoustic oscillation formulas confirmed Domain 2 | l_A = 96*pi |
| 135 | z_* = 33^2 classified as numerological | Crossover refined |
| 136 | Formalized investigation, updated script | 22/22 PASS |
