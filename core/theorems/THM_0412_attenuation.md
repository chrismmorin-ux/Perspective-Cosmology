# THM_0412 Theorem: Attenuation

**Tag**: 0412
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/03_propagation.md

---

## Requires

- [DEF_0204: Connectivity weights Γ]
- [DEF_0221: Propagation operator P_D]

## Provides

- Exponential decay of distant content

---

## Statement

**Theorem Pr.2 (Attenuation)**

```
If max_σ Γ(σ) = γ_max < 1, then:
||(P_D)^n|| ≤ γ_max^n → 0
```

Distant content attenuates exponentially.

---

## Proof

Each application of P_D multiplies by factors ≤ γ_max.
After n steps, the product is bounded by γ_max^n.
Since γ_max < 1, this converges to 0 as n → ∞.

QED

---

## Notes

This establishes an effective "horizon" for propagation.
Content beyond a certain distance becomes negligible.
