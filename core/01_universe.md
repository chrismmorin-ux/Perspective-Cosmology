# Universe Structure

REQUIRES: 00_notation
DEFINES: U, P, Σ, Γ, C, V, B
STATUS: AXIOM

---

## Definition

**U** is a 6-tuple:

```
U = (P, Σ, Γ, C, V, B)
```

### Components

**P** (Points)
- Finite, non-empty set
- |P| < ∞

**Σ** (Simplicial Complex)
- Σ_0 = P (0-simplices are points)
- Σ_k = {σ ⊂ P : |σ| = k+1, all faces in Σ} (k-simplices)
- Σ = ∪_k Σ_k

**Γ** (Connectivity Weights)
- Γ: Σ → [0,1]
- Γ(σ) = 0 ⟹ σ not effectively present
- Γ(σ) = 1 ⟹ maximal connection

**V** (Value Space)
- Finite-dimensional inner product space over ℝ (or ℂ)
- dim(V) = n < ∞
- Inner product: ⟨·,·⟩

**C** (Content Map)
- C: P → V
- C(p) = "what exists at p"

**B** (Orthonormal Basis)
- B = {b_1, ..., b_n} ⊂ V
- ⟨b_i, b_j⟩ = δ_ij
- span(B) = V

---

## Axioms

**U1 (Finiteness)**
```
|P| < ∞  and  dim(V) < ∞
```

**U2 (Connectivity)**
```
The graph (P, Σ_1) is connected
```

**U3 (Non-Triviality)**
```
∃ p, q ∈ P : C(p) ≠ C(q)
```

**U4 (Closure)**
```
∀ σ ∈ Σ, ∀ τ ⊂ σ : τ ∈ Σ
```

---

## Immediate Consequences

**Lemma U.1**: P has at least 2 elements.
```
Proof: U3 requires distinct p, q. QED
```

**Lemma U.2**: Σ_1 is non-empty.
```
Proof: U2 requires connected graph on |P| ≥ 2. QED
```

**Lemma U.3**: Any C(p) decomposes uniquely in B.
```
C(p) = Σᵢ cᵢ(p) bᵢ  where cᵢ(p) = ⟨C(p), bᵢ⟩
```
