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

**Status breakdown**:
- Form (1-2γ): DERIVED from asymmetry structure
- Coefficient 1: ASSUMED (simplest choice)
- Scale τ₀: EMPIRICAL
