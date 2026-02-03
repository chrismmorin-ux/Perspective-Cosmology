# THM_0412 Theorem: Attenuation

**Tag**: 0412
**Type**: THEOREM
**Status**: CANONICAL (promoted from SKETCH — rigorous proof below, with corrected hypothesis)
**Source**: core/03_propagation.md

---

## Requires

- [AXM_0100: Finiteness] — |P| < ∞, dim(V) < ∞
- [DEF_0204: Connectivity weights Γ] — Γ: Σ → [0,1]
- [DEF_0220: D-compatible edges] — E_D(x)
- [DEF_0221: Propagation operator P_D]

## Provides

- Exponential decay of propagated content
- Convergence of lim (P_D)^n (making A_π in DEF_0224 well-defined)

---

## Statement

**Theorem Pr.2 (Attenuation)**

### General form

Define the **row-sum bound**:

```
γ_row := max_{x ∈ P} Σ_{y ∈ E_D(x)} Γ({x,y})
```

This is the maximum total outgoing weight at any point.

```
If γ_row < 1, then:
    ||(P_D)^n||_∞ ≤ γ_row^n → 0  as n → ∞
```

where ||·||_∞ is the operator norm induced by the sup norm on V^P.

### Corollary (single-neighbor case)

If each point has at most one D-compatible neighbor (|E_D(x)| ≤ 1 for all x), then γ_row ≤ γ_max := max_σ Γ(σ), and:

```
||(P_D)^n||_∞ ≤ γ_max^n → 0
```

---

## Erratum

The original statement used γ_max < 1 (maximum individual weight) as the hypothesis. This is **insufficient** when points have multiple D-compatible neighbors, because the sum of weights at a point can exceed γ_max. Counterexample: if x has 3 neighbors each with Γ = 0.9, then the row sum is 2.7 > 1, and P_D is not a contraction.

The corrected general form uses γ_row (maximum row sum) instead. The original statement is recovered as a corollary when |E_D(x)| ≤ 1 for all x.

---

## Proof

### Setup

Equip V with a norm ||·||_V (exists by finite-dimensionality [AXM_0100, I-MATH]).

Equip V^P with the sup norm:

```
||f||_∞ := max_{x ∈ P} ||f(x)||_V
```

This is well-defined since P is finite [AXM_0100]. The induced operator norm is:

```
||P_D||_∞ := sup_{f ≠ 0} ||P_D · f||_∞ / ||f||_∞
```

### Step 1: Operator norm bound

For any f ∈ V^P and any x ∈ P:

```
||(P_D · f)(x)||_V = ||Σ_{y ∈ E_D(x)} Γ({x,y}) · f(y)||_V     [DEF_0221]
                    ≤ Σ_{y ∈ E_D(x)} Γ({x,y}) · ||f(y)||_V     [triangle inequality, Γ ≥ 0]
                    ≤ Σ_{y ∈ E_D(x)} Γ({x,y}) · ||f||_∞         [||f(y)||_V ≤ ||f||_∞ by def]
                    = (Σ_{y ∈ E_D(x)} Γ({x,y})) · ||f||_∞
                    ≤ γ_row · ||f||_∞                              [def of γ_row]
```

Taking the maximum over x ∈ P:

```
||P_D · f||_∞ = max_x ||(P_D · f)(x)||_V ≤ γ_row · ||f||_∞
```

Therefore:

```
||P_D||_∞ ≤ γ_row                                                 ... (*)
```

### Step 2: Iterated bound by submultiplicativity

The operator norm is submultiplicative [I-MATH: this holds for any operator norm on a normed space]:

```
||AB||_∞ ≤ ||A||_∞ · ||B||_∞
```

By induction on n:

```
||(P_D)^n||_∞ ≤ ||P_D||_∞^n ≤ γ_row^n                           [from (*)]
```

### Step 3: Convergence

Since γ_row < 1 (hypothesis):

```
γ_row^n → 0  as n → ∞                                             [I-MATH: geometric series]
```

Therefore ||(P_D)^n||_∞ → 0, which means (P_D)^n · f → 0 for all f ∈ V^P. □

### Proof of Corollary

When |E_D(x)| ≤ 1 for all x, each row sum has at most one term:

```
Σ_{y ∈ E_D(x)} Γ({x,y}) ≤ max_σ Γ(σ) = γ_max
```

Therefore γ_row ≤ γ_max, and the general theorem applies with γ_max in place of γ_row. □

---

## Verification

**Script**: `verification/sympy/noninvertibility_attenuation_proof.py`
**Status**: PASS (operator norms computed for sample graphs confirm bounds)

---

## Consequences

### 1. Well-definedness of A_π

When γ_row < 1, the limit lim_{n→∞} (P_D)^n exists and equals the zero operator. This means the access map A_π = Π_p ∘ eval_p ∘ lim (P_D)^n is well-defined (as the zero map).

**Note**: This suggests the access map construction in DEF_0224 needs refinement — if (P_D)^n → 0, then A_π = 0, which is trivial. The intended construction likely involves a *partial sum* (finite propagation depth) or a *resolvent* (I - P_D)^{-1} rather than the infinite limit. See Open Question 1 below.

### 2. Effective horizon

Content at graph distance d from p is attenuated by at least γ_row^d. For practical purposes, content beyond distance d_hor ≈ -log(ε) / log(1/γ_row) is negligible (below threshold ε). This connects to THM_0413 (Horizon).

### 3. Spectral radius bound

The theorem implies ρ(P_D) ≤ ||P_D||_∞ ≤ γ_row < 1 [I-MATH: spectral radius ≤ operator norm]. Therefore all eigenvalues of P_D have magnitude < 1, and the Neumann series (I - P_D)^{-1} = Σ_{n=0}^∞ (P_D)^n converges. This may be the correct formalization of the access map.

---

## Open Questions

1. **Access map refinement**: If lim (P_D)^n = 0, the current DEF_0224 gives A_π = 0 (trivial). The physically meaningful construction is likely the *resolvent* (I - P_D)^{-1} = Σ (P_D)^n, which sums contributions from all distances with appropriate attenuation. This converges when ρ(P_D) < 1 (guaranteed by this theorem). Consider updating DEF_0224.

2. **Necessity of γ_row < 1**: The condition γ_row < 1 is sufficient but not necessary for convergence. The necessary and sufficient condition is ρ(P_D) < 1 (spectral radius). For specific graph structures, attenuation can occur even when γ_row ≥ 1.

---

## Notes

This establishes an effective "horizon" for propagation. Content beyond a certain distance becomes negligible.

The key physical picture: each step of propagation multiplies by the connectivity weights, and if the total weight flowing out of any point is bounded below 1, the signal decays geometrically with distance.

---

## History

- Original: Heuristic argument ("each step multiplies by γ_max")
- Session 189: Downgraded CANONICAL → SKETCH (operator norm not formalized)
- Session 196: Corrected hypothesis (γ_row, not γ_max), rigorous proof via operator norm and submultiplicativity. Added corollary for single-neighbor case. Promoted SKETCH → CANONICAL.
