# THM_0413 Theorem: Horizon

**Tag**: 0413
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/03_propagation.md
**Updated**: Session 133 (CR-008: added formal statement and proof)

---

## Requires

- [DEF_0204: Connectivity weights Γ]
- [THM_0412: Attenuation]

## Provides

- Horizon structure: edges with Γ = 1 propagate without attenuation
- Horizon subgraph H_Γ

---

## Statement

**Theorem Pr.3 (Horizon)**

```
Let H_Γ = { σ ∈ Σ₁ : Γ(σ) = 1 } be the subgraph of unit-weight edges.

(a) On H_Γ, information propagates without attenuation:
    For any path (σ₁, ..., σ_n) entirely within H_Γ:
    ||(P_D)^n|| along this path = 1

(b) On the complement Σ₁ \ H_Γ, attenuation applies:
    max_{σ ∉ H_Γ} Γ(σ) = γ*_max < 1 implies
    ||(P_D)^n|| along paths outside H_Γ ≤ (γ*_max)^n → 0

(c) The effective horizon of perspective π is the connected component
    of p (anchor point) in H_Γ, plus an attenuation boundary layer
    of depth ~ -1/log(γ*_max) in the complement.
```

---

## Proof

**(a)** Along edges with Γ(σ) = 1, each application of P_D multiplies by factor 1. After n steps: ||(P_D)^n|| ≤ 1^n = 1. No decay occurs.

**(b)** This is THM_0412 applied to the restricted subgraph Σ₁ \ H_Γ, where the maximum weight γ*_max < 1 by construction.

**(c)** Combining (a) and (b): information reaches all of H_Γ without loss, and decays exponentially beyond. The characteristic decay length is:
```
ℓ = -1/log(γ*_max)
```
which gives the effective boundary layer width.

QED

---

## Notes

The horizon H_Γ is the "lossless" subgraph — the region where perspective is perfect. Beyond it, information attenuates exponentially.

**Physical interpretation** (Layer 2): In the correspondence with spacetime, the horizon structure relates to causal horizons. Edges with Γ = 1 are "causal connections" and the boundary layer gives the effective horizon scale.
