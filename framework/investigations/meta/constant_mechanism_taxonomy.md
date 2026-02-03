# Dimensionless Constant Mechanism Taxonomy

**Status**: ACTIVE
**Created**: Session 164, 2026-01-30
**Last Updated**: Session 164, 2026-01-30
**Confidence**: [DERIVATION] for classification scheme; individual constants retain their original confidence tags

---

## Plain Language

The framework derives many dimensionless constants, but not all by the same mechanism. Some come from counting quantum states (like alpha = 1/137), others from comparing sizes of mathematical structures (like sin^2 theta_W = 28/121), and still others from prime number patterns or crystallization dynamics.

This taxonomy classifies each constant by *how* it is derived, not just *what* its value is. Understanding the mechanism type helps identify which constants are structurally related, and which gaps would affect multiple predictions simultaneously.

**One-sentence version**: Framework constants derive from five distinct mechanisms: Born-rule counting, algebraic dimension ratios, prime attractors, crystallization potentials, and dimensional matching.

---

## Question

Can the framework's dimensionless constant predictions be organized by derivation mechanism, and does this organization reveal structural patterns?

---

## The Five Mechanism Categories

### Category 1: Tilt-Type (Born-rule probability on N_I modes)

**Mechanism**: A single quantum of tilt excitation in the N_I = 137 dimensional interface space has Born-rule probability P = 1/N_I per mode (THM_04A2). Constants of this type involve N_I = n_d^2 + n_c^2 = 137 and/or Phi_6(n_c) = 111.

**Defining feature**: Uses the democratic counting / Born-rule mechanism. The interface mode count N_I appears explicitly.

| Constant | Formula | Value | Precision | Tier |
|----------|---------|-------|-----------|------|
| 1/alpha | N_I + n_d/Phi_6 = 15211/111 | 137.036036 | 0.27 ppm | 1 |
| m_p/m_e | 1836 + n_c/72 = 132203/72 | 1836.153 | 0.06 ppm | 1 |
| delta T/T | alpha^2/Im_H | 1.78e-5 | 1.4% | 2 |
| eta (baryon asymmetry) | alpha^4 * 3/14 | 6.08e-10 | 0.39% | 2 |

**Note**: m_p/m_e uses 1836 = (n_c+1)(n_c-2)(n_c+6) rather than N_I directly, but the correction 11/72 involves crystal dimension. Classification as tilt-type is because the leading term 1836 derives from the same n_c = 11.

### Category 2: Relational-Type (Division algebra dimension ratios)

**Mechanism**: These constants are ratios of dimensions of the four normed division algebras (R, C, H, O) or their sub-structures. No interface mode counting is involved.

**Defining feature**: Uses only n_d, n_c, Im_O, Im_H, dim_C, dim_O, etc. Does NOT use N_I or Phi_6.

| Constant | Formula | Value | Precision | Tier |
|----------|---------|-------|-----------|------|
| sin^2(theta_W) | n_d * Im_O / n_c^2 = 28/121 | 0.2314 | 843 ppm | 2 |
| Koide Q | dim(C) / Im(H) = 2/3 | 0.6667 | EXACT | 1 |
| Omega_Lambda | (C^2 + Im_H^2)/(n_c + O) = 13/19 | 0.6842 | 0.07% | 2 |
| Omega_m | 6/19 | 0.3158 | 0.16% | 2 |

**Key insight**: These constants depend only on the *algebraic structure* (which division algebras exist and their dimensions), not on the dynamics of tilt or crystallization.

### Category 3: Attractor-Type (Prime number structure)

**Mechanism**: These constants involve specific primes selected by the framework's prime attractor mechanism (AXM_0118). Many involve primes expressible as sums of two squares (p = a^2 + b^2).

**Defining feature**: Uses prime decompositions, often p/(p+q) or a/b forms where a, b relate to prime structure.

| Constant | Formula | Value | Precision | Tier |
|----------|---------|-------|-----------|------|
| cos(theta_W) on-shell | 171/194 (= M_W/M_Z) | 0.8814 | 3.75 ppm | 1 |
| Koide theta | pi * 73/99 | 2.3165 rad | 0.006% | 1 |
| sin^2(theta_W) prime | 17/73 | 0.2329 | 0.72% | 2 |

**Note**: The attractor-type mechanism is the least understood. The "selection rule" for which primes appear (73, 97, 194, etc.) relates to the division algebra dimensions but the full mechanism is [CONJECTURE].

### Category 4: Slow-Roll-Type (Crystallization potential parameters)

**Mechanism**: These constants derive from the Landau-type effective potential V_eff for the crystallization order parameter. Slow-roll parameters (epsilon, eta) determine inflationary observables.

**Defining feature**: Uses V_eff derivatives evaluated at the crystallization saddle point.

| Constant | Formula | Value | Precision | Tier |
|----------|---------|-------|-----------|------|
| n_s (spectral index) | 193/200 | 0.9650 | 0.01% | 2 |
| r (tensor-to-scalar) | 7/200 = Im_O/200 | 0.035 | KEY TEST | 2 |

**Key test**: CMB-S4 (~2028) will measure r to precision ~0.003. If r = 0.035 +/- 0.003 is confirmed, this is a genuine prediction verified after being locked.

### Category 5: Structural-Type (Dimensional matching)

**Mechanism**: These are integer-valued constants that match by direct dimensional/counting arguments. No fine-tuning or probability is involved.

**Defining feature**: Exact integer predictions from algebraic structure.

| Constant | Formula | Value | Precision | Tier |
|----------|---------|-------|-----------|------|
| n_gen (generations) | Im(H) = 3 | 3 | EXACT | 1 |
| CMB l_1 (first peak) | 2 * n_c * (n_c - 1) = 220 | 220 | EXACT | 1 |

---

## Cross-Category Observations

### Pattern 1: Tier 1 constants span all categories

Sub-10-ppm constants appear in every category except slow-roll, suggesting the framework's precision is not limited to one mechanism.

### Pattern 2: Tilt-type and relational-type are independent

Tilt-type constants use N_I = 137 (the interface mode count). Relational-type constants use dimension ratios without N_I. These are structurally independent mechanisms, yet both produce sub-percent results. If one mechanism failed, the other's predictions would survive.

### Pattern 3: Gap correlation

If the Born rule fails (affecting Category 1), all tilt-type constants would shift simultaneously. If n_c changed (hypothetically), both Categories 1 and 2 would be affected. The categories share algebraic inputs but use them differently.

---

## Open Questions

1. Is the attractor-type mechanism (Category 3) derivable from the others, or genuinely independent?
2. Why does the slow-roll category produce only Tier 2 constants? Is this a limitation of the potential formalism or of measurement precision?
3. Can m_p/m_e be reclassified? Its leading term 1836 = (n_c+1)(n_c-2)(n_c+6) is purely algebraic (Category 2 flavor) but the correction uses crystal structure.
4. Are there constants that span two categories? (E.g., constants with both tilt and relational components)

---

## Dependencies

- Uses: THM_04A2 (tilt mechanism), DEF_02B3 (N_I), all division algebra structure
- Used by: Falsification analysis (which mechanism breaks first?)

---

## Verification

- `verification/sympy/constant_taxonomy_verification.py` -- 23/23 PASS

---

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 164 | Initial taxonomy with 15 constants in 5 categories | 23/23 PASS |
