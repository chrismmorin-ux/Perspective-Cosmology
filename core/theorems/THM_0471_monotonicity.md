# THM_0471 Theorem: Monotonicity

**Tag**: 0471
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/18_dynamics.md

---

## Requires

- [DEF_02A1: Decoherence rate]

## Provides

- Decoherence rate decreases with overlap

---

## Statement

**Theorem D.2 (Monotonicity)**

```
For 0 ≤ γ ≤ 0.5:
    d(Γ_dec)/dγ = -2/τ₀ < 0
```

Decoherence rate decreases as overlap increases.

---

## Proof

```
Γ_dec = (1 - 2γ)/τ₀

d(Γ_dec)/dγ = d/dγ[(1 - 2γ)/τ₀] = -2/τ₀ < 0
```

QED
