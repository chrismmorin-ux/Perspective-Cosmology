# THM_04A5: Uncertainty Principle

**Status**: CANONICAL
**Layer**: 1
**Created**: Session 181 (formalization from THM_0491)

---

## Requires

- [THM_0491: Hilbert Space Structure] — V_π is a finite-dimensional complex Hilbert space

## Provides

- Robertson uncertainty relation: ΔA · ΔB ≥ ½|⟨[A,B]⟩|
- Incompatible observables cannot be simultaneously sharp
- Foundation for Heisenberg uncertainty (with Layer 2 identification)

---

## Statement

**Theorem (Uncertainty Principle)**

```
For any two Hermitian operators A, B on V_π and any state |ψ⟩:

    ΔA · ΔB ≥ ½ |⟨ψ| [A, B] |ψ⟩|

where ΔA = √(⟨A²⟩ - ⟨A⟩²) is the standard deviation,
and [A,B] = AB - BA is the commutator.
```

This is a **mathematical theorem** about operators on Hilbert space, not a physical postulate.

---

## Proof

### Step 1: Setup [from THM_0491]

V_π is a finite-dimensional complex Hilbert space with inner product ⟨·,·⟩.
Let A, B be Hermitian operators (self-adjoint: A† = A, B† = B).
Let |ψ⟩ ∈ V_π with ||ψ|| = 1.

Define centered operators:
```
Â = A - ⟨A⟩I,    where ⟨A⟩ = ⟨ψ|A|ψ⟩
B̂ = B - ⟨B⟩I,    where ⟨B⟩ = ⟨ψ|B|ψ⟩
```

Then:
```
(ΔA)² = ⟨ψ|Â²|ψ⟩ = ||Â|ψ⟩||²
(ΔB)² = ⟨ψ|B̂²|ψ⟩ = ||B̂|ψ⟩||²
```

### Step 2: Cauchy-Schwarz [I-MATH]

By the Cauchy-Schwarz inequality in V_π:
```
||Â|ψ⟩||² · ||B̂|ψ⟩||² ≥ |⟨ψ|ÂB̂|ψ⟩|²
```

Therefore:
```
(ΔA)² · (ΔB)² ≥ |⟨ψ|ÂB̂|ψ⟩|²
```

### Step 3: Decomposition [I-MATH]

Decompose the product ÂB̂ into symmetric and antisymmetric parts:
```
ÂB̂ = ½{Â,B̂} + ½[Â,B̂]
```

where {Â,B̂} = ÂB̂ + B̂Â (anticommutator) and [Â,B̂] = ÂB̂ - B̂Â (commutator).

Note: {Â,B̂} is Hermitian (real expectation value), [Â,B̂] is anti-Hermitian (purely imaginary expectation value).

### Step 4: Bound [I-MATH]

```
|⟨ψ|ÂB̂|ψ⟩|² = (½⟨{Â,B̂}⟩)² + (½⟨[Â,B̂]⟩)²
              ≥ (½⟨[Â,B̂]⟩)²
              = ¼|⟨ψ|[A,B]|ψ⟩|²
```

The last equality uses [Â,B̂] = [A,B] (centering doesn't affect commutator).

### Step 5: Conclusion

```
(ΔA)²(ΔB)² ≥ ¼|⟨ψ|[A,B]|ψ⟩|²

⟹  ΔA · ΔB ≥ ½|⟨ψ|[A,B]|ψ⟩|
```

QED

---

## Corollaries

### Corollary 1 (Incompatibility)
```
If [A,B] ≠ 0, then ΔA and ΔB cannot both be zero simultaneously.
No state |ψ⟩ is simultaneously an eigenstate of both A and B
(unless |ψ⟩ is in the kernel of [A,B]).
```

### Corollary 2 (Heisenberg Form) [LAYER 2/3]
```
With Layer 2 identification:
  A = x̂ (position), B = p̂ (momentum), [x̂, p̂] = iℏI

Then: Δx · Δp ≥ ℏ/2

Note: ℏ value is empirical [A-IMPORT]. The FORM is derived;
the numerical bound depends on ℏ.
```

### Corollary 3 (Energy-Time) [LAYER 2/3]
```
With A = Ĥ (energy), B = any observable:

ΔE · Δt ≥ ℏ/2

where Δt = ΔB / |d⟨B⟩/dt| is the timescale for B to change
by one standard deviation.
```

---

## Dependencies

| Dependency | Type | Role |
|-----------|------|------|
| THM_0491 | [D] | V_π is a finite-dimensional Hilbert space over C |
| Cauchy-Schwarz inequality | [I-MATH] | Standard Hilbert space theorem |
| Commutator algebra | [I-MATH] | Operator decomposition |

---

## Verification

**Script**: `verification/sympy/qm_chain_completeness.py` — Part 4

The proof is entirely mathematical (Cauchy-Schwarz on Hilbert space). No numerical verification needed beyond confirming the algebra, which is standard [I-MATH].

---

## Significance

The uncertainty principle is often presented as a mysterious quantum postulate. In this framework, it is a **mathematical theorem**:

1. THM_0491 gives us Hilbert space (from axioms)
2. Cauchy-Schwarz is a theorem about inner product spaces
3. The uncertainty relation follows immediately

There is nothing to "explain" about uncertainty — it is the geometry of the state space.

---

## Checklist Reference

Maps to: **F8 (Uncertainty Principle)** in PHYSICS_CHECKLIST.md
Previous status: PARTIAL
New status: **DERIVED** (general form). Layer 2 for specific ΔxΔp ≥ ℏ/2.
