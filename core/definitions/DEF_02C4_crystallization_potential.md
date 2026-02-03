# DEF_02C4 Definition: Crystallization Potential

**Tag**: 02C4
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: framework/investigations/cosmology/hilltop_inflation_canonical.md
**Added**: Session 144 (formalization from S101, S127)

---

## Requires

- [DEF_02C0: Order parameter ε]
- [AXM_0117: Crystallization tendency]

## Provides

- Effective potential V(ε) governing crystallization dynamics
- Hilltop inflation potential form

---

## Statement

The **crystallization potential** is:

```
V(ε) = V₀ (1 - ε²/μ²)
```

where:
- V₀ is the energy scale at ε = 0 (symmetric phase)
- μ² is the hilltop curvature parameter

### Hilltop curvature parameter

```
μ² = (C + H) · H⁴ / Im_O = 6 · 256 / 7 = 1536/7
```

where C = 2 (complex dimension), H = 4 (quaternion dimension), Im_O = 7 (imaginary octonion dimension).

### Equivalent Landau form

In the Landau expansion around the symmetric point:

```
L = (M_Pl²/2) [-g^μν (∂_μ ε)(∂_ν ε) + a|ε|² - b|ε|⁴]
```

The Mexican hat equilibrium ε*_MH = √(a/(2b)) = α gives:

```
b = α M_Pl⁴,  a = 2α³ M_Pl⁴,  a/b = 2α²
```

This yields m_tilt ≈ 2 × 10¹⁶ GeV (GUT scale) and m_tilt/H ≈ 34 during inflation.

**Convention note (S171)**: The earlier relation a/b = 2α⁴ assumed ε* = α² (portal coupling). The dynamics analysis (S132-133) established ε*_MH = α with b = α M_Pl⁴, giving a/b = 2α². Both are correct for their respective interpretations: ε*_portal = α² (cosmological probability), ε*_MH = α (local dynamics amplitude). See DEF_02C0 and `verification/sympy/eps_star_convention_resolution.py`.

---

## Slow-Roll Parameters

The hilltop form gives exact slow-roll parameters, evaluated at the CMB field value φ_CMB = μ/√6 (i.e., x = (φ/μ)² = 1/6):

| Parameter | Value | Derivation |
|-----------|-------|------------|
| ε_SR | 7/3200 = 2.1875 × 10⁻³ | (1/2)(V'/V)² at x=1/6: 2/(6μ²(1-x)²) = 12/(25μ²) |
| η | -7/640 = -1.09375 × 10⁻² | V''/V at x=1/6: -2/(μ²(1-x)) = -12/(5μ²) |
| η/ε | -5 (exactly) | = -(n_d + 1), independent of μ² |

**Note**: The formulas above use M_Pl = 1 units. See `verification/sympy/lcdm_deviations_from_hilltop.py` for the complete derivation (16/17 PASS).

---

## Dependencies

- [DEF_02C0]: Order parameter ε
- [AXM_0117]: Crystallization tendency (drives ε toward minimum)
- n_d = 4, n_c = 11: Division algebra dimensions
- [A-IMPORT: M_Pl]: Planck mass (energy scale)

## Used By

- Spectral index: n_s = 1 - 6ε + 2η = 193/200 = 0.9650
- Tensor-to-scalar ratio: r = 16ε = 7/200 = 0.035
- All inflationary observables
- Cosmological constant (via ground state energy)

---

## Verification

- `verification/sympy/crystallization_lagrangian.py` — 8/8 PASS
- `verification/sympy/lcdm_deviations_from_hilltop.py` — 16/17 PASS
- `verification/sympy/eps_star_convention_resolution.py` — 18/18 PASS (S171: a/b convention clarified)

---

## Assumption Classification (Session 181 Audit)

| Component | Classification | Notes |
|-----------|---------------|-------|
| Hilltop form V = V₀(1 - ε²/μ²) | [A-STRUCTURAL] | Simplest potential with unstable max; not unique |
| μ² = 1536/7 | [DERIVATION] | From division algebra dims: (C+H)H^4/Im_O |
| Slow-roll parameters | [D] DERIVED | Exact values given V and μ² (verified S181) |
| n_s = 193/200 | [D] from ε_SR and η | Standard inflation formulas [I-MATH] |
| r = 7/200 = 0.035 | [D] from ε_SR | Standard inflation formula [I-MATH] |
| b = α M_Pl^4 | [CONJECTURE] | Asserted, not derived from axioms |
| V₀ (energy scale) | [A-IMPORT: Planck scale] | Sets overall normalization |

**Slow-roll formula verification (Session 181)**: All intermediate formulas confirmed via SymPy-MCP. ε_SR = 7/3200, η = -7/640, η/ε = -5, n_s = 193/200, r = 7/200. No errors found (CR-045 resolved or was fixed in prior session).

---

## Notes

The hilltop form V(ε) = V₀(1 - ε²/μ²) is the simplest potential consistent with crystallization: ε = 0 is an unstable maximum (symmetric crystal), and the potential drives toward finite ε*. The quadratic hilltop gives V''' = 0, which simplifies higher-order inflationary observables (ξ² = 0).

The tensor-to-scalar ratio r = 7/200 = 0.035 is the framework's most testable near-term prediction. CMB-S4 (expected sensitivity σ ~ 0.001) will confirm or falsify this by approximately 2028.
