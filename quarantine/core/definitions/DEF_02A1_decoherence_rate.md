# DEF_02A1 Definition: Intrinsic Decoherence Rate

**Tag**: 02A1
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/18_dynamics.md

---

## Requires

- [AXM_0108: Fundamental time scale τ₀]
- [DEF_02A0: Asymmetry measure A(γ)]

## Provides

- Γ_dec: Intrinsic decoherence rate

---

## Statement

**DERIVED (Form):**

The intrinsic decoherence rate for γ ≤ 0.5 is:

```
Γ_dec = -A(γ) / τ₀ = (1 - 2γ) / τ₀
```

**For γ > 0.5:**
```
Γ_intrinsic = 0  (tendency toward coherence is thermodynamically frustrated)
```

**Full formula:**
```
Γ_intrinsic = max(0, (1-2γ)/τ₀)
```

---

## Notes

**Assumption Classification (Session 181 Audit)**:

| Component | Classification | Notes |
|-----------|---------------|-------|
| Form (1-2γ) | [D] DERIVED | From asymmetry structure DEF_02A0 |
| Coefficient 1 | [A-STRUCTURAL] | Simplest normalization; not derived |
| Scale τ₀ | [A-IMPORT: Planck time] | Empirical; AXM_0108 defines existence but not value |

**Honest assessment**: The functional form is derived, but the overall scale depends on τ₀ which is not derivable from axioms. τ₀ is the Planck time t_P = sqrt(hbar G/c^5), which involves three empirical constants. This definition bridges Layer 0/1 mathematics to Layer 2 physics via the import of τ₀.
