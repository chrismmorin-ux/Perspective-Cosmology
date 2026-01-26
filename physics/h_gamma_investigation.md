# Investigation: Deriving h(γ) from Axioms

**Date**: 2026-01-26
**Issue**: I-005 - h(γ) Function Not Derived
**Goal**: Either derive h(γ) = 2γ(1-γ) from axioms, or mark as assumption

---

## The Formula

```
h(γ) = 2γ(1-γ)

Used in: Γ_grav = Gm²/(ℏΔx) × h(γ)

Properties:
- h(0) = 0 (no gravitational decoherence at low-γ)
- h(0.5) = 0.5 (maximum)
- h(1) = 0 (no gravitational decoherence at high-γ)
- Symmetric: h(γ) = h(1-γ)
```

**Claim**: Gravitational decoherence is modified by h(γ), peaking at intermediate overlap.

---

## Analysis

### Why This Form?

The function h(γ) = 2γ(1-γ) is:
- The simplest symmetric polynomial with zeros at γ = 0 and γ = 1
- Maximum at γ = 0.5
- Normalized so h(0.5) = 0.5

### Alternative Functions with Same Qualitative Behavior

| Function | h(0.5) | Behavior |
|----------|--------|----------|
| 2γ(1-γ) | 0.5 | Claimed |
| 4γ(1-γ) | 1.0 | Rescaled |
| 4γ²(1-γ)² | 0.25 | Sharper peak |
| sin(πγ) | 1.0 | Trigonometric |
| √[γ(1-γ)] | 0.5 | Square root |

**All these have the same qualitative properties.** Why is 2γ(1-γ) privileged?

### Derivation Status

| Question | Answer |
|----------|--------|
| Does framework specify h(γ)? | NO |
| Is there a principle selecting this form? | NO |
| Does it follow from Γ-structure? | NO |
| Is the factor of 2 derived? | NO |

---

## Why Derivation Fails

### Same Problem as I-004

The h(γ) function modifies a rate (Γ_grav). This requires:

1. **Dynamics** - not in axioms
2. **Connection to gravity** - G is conjectured, not derived
3. **Selection principle** - why this function specifically

### What Would Be Needed

To derive h(γ), we would need to show:
1. Gravitational decoherence emerges from Γ-structure
2. The γ-dependence is uniquely determined
3. The coefficient (2) follows from geometry

**None of these exist in the current framework.**

---

## The Honest Assessment

### The function h(γ) = 2γ(1-γ) is:

1. **Plausible** - has correct symmetry and extrema
2. **Arbitrary** - many functions would work equally well
3. **Not derived** - asserted without proof

### Physical Interpretation

The claimed interpretation:
- Gravitational decoherence peaks when quantum and classical aspects are balanced
- At pure limits (γ = 0 or 1), gravitational decoherence vanishes

**Problem**: This is counterintuitive and has no observational support. Why would classical objects (γ → 0) have LESS gravitational decoherence?

---

## Recommendation

**Mark as ASSUMPTION (A16)**

Same treatment as I-004:
- Formula is dimensional analysis + symmetry argument
- Not derivable from current axioms
- Predictions using it are SPECULATION

---

## Comparison to Penrose-Diosi

| Aspect | Penrose-Diosi | Perspective |
|--------|---------------|-------------|
| Formula | Γ = Gm²/(ℏR₀) | Γ = Gm²/(ℏΔx) × h(γ) |
| Cutoff | R₀ (free parameter) | λ_C (fixed by mass) |
| γ-dependence | None | h(γ) = 2γ(1-γ) |
| Status | Well-studied | Asserted |

The h(γ) modification is the claimed novelty, but it's not derived.

---

*Investigation complete: 2026-01-26*
*Verdict: Cannot derive from axioms. Mark as assumption A16.*
