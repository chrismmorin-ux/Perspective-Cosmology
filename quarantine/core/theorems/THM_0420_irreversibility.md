# THM_0420 Theorem: Irreversibility

**Tag**: 0420
**Type**: THEOREM
**Status**: CANONICAL (proof corrected Session 196 — uses revised DEF_0227)
**Source**: core/04_adjacency.md

---

## Requires

- [DEF_0227: Information loss ΔI] — ΔI(π₁ → π₂) = dim(U_{π₁}) - dim(U_{π₂})
- [AXM_0107: Non-negative loss] — valid transitions require ΔI ≥ 0

## Provides

- Positive information loss implies the reverse transition is invalid
- Content lost in transition is unrecoverable from the target perspective

---

## Statement

**Theorem Adj.1 (Irreversibility)**

```
If ΔI(π₁ → π₂) > 0, then the reverse transition π₂ → π₁ is not valid.
```

In particular, no valid transition from π₂ can restore the accessible set U_{π₁}.

---

## Proof

### Primary argument (from ΔI and AXM_0107)

Suppose ΔI(π₁ → π₂) > 0.

**Step 1**: By DEF_0227:

```
dim(U_{π₁}) - dim(U_{π₂}) > 0
⟹  dim(U_{π₂}) < dim(U_{π₁})
```

**Step 2**: By anti-symmetry of ΔI [DEF_0227]:

```
ΔI(π₂ → π₁) = dim(U_{π₂}) - dim(U_{π₁}) = −ΔI(π₁ → π₂) < 0
```

**Step 3**: By AXM_0107, valid transitions require ΔI ≥ 0. Since ΔI(π₂ → π₁) < 0, the transition π₂ → π₁ is not valid. QED

### Complementary argument (from overlap loss)

Even setting aside AXM_0107, the content is physically unrecoverable:

The overlap loss λ(π₁, π₂) = dim(U_{π₁}) − dim(U_{π₁} ∩ U_{π₂}) measures content that π₁ could access but π₂ cannot. When ΔI > 0, we have dim(U_{π₂}) < dim(U_{π₁}), which implies:

```
λ(π₁, π₂) = dim(U_{π₁}) − dim(U_{π₁} ∩ U_{π₂})
            ≥ dim(U_{π₁}) − dim(U_{π₂})     [since dim(A ∩ B) ≤ dim(B)]
            = ΔI(π₁ → π₂) > 0
```

So λ(π₁, π₂) > 0: there is content in U_{π₁} that is genuinely absent from U_{π₂}. Since π₂ does not have access to this content, no operation on U_{π₂} can reconstruct it. The lost information is irrecoverable regardless of what transitions π₂ makes.

---

## Verification

**Script**: `verification/sympy/conservation_second_law_proof.py`
**Status**: PASS (irreversibility verified as part of directed graph asymmetry tests)

---

## Notes

**Scope**: This proves the direct reverse π₂ → π₁ is invalid. It does NOT rule out:
- Indirect return via a path π₂ → π₃ → ... → π₁ (ruled out by THM_0461, No Loops)
- Approximate reversibility: a transition to some π₃ with dim(U_{π₃}) = dim(U_{π₁}) but U_{π₃} ≠ U_{π₁} — consistent with CPT-like approximate time reversal

**Strength of result**: Irreversibility holds for two independent reasons:
1. AXM_0107 forbids the reverse (ΔI < 0)
2. Content is physically lost (λ > 0, information absent from U_{π₂})

Either reason alone suffices. Together they make irreversibility robust.

---

## Erratum (Session 196)

The original proof (CR-039) used the old DEF_0227 formula ΔI = dim(U_{π₁}) − dim(U_{π₁} ∩ U_{π₂}) and the old cardinality-based THM_0450. The logical structure was:

1. Old ΔI > 0 → dim(U_{π₁}) > dim(U_{π₁} ∩ U_{π₂}) ... (*)
2. Apply cardinality conservation to get dim(U_{π₂}) < dim(U_{π₁}) ... (**)
3. Exact inverse requires dim(U_{π₁} ∩ U_{π₂}) = dim(U_{π₁}), contradicting (*)

Step 2 was logically broken: the old ΔI > 0 does NOT imply dim(U_{π₂}) < dim(U_{π₁}) (see THM_0451 erratum for counterexample). The conclusion happened to be correct but the reasoning was invalid.

With the corrected DEF_0227 (ΔI = net dimension change), the proof simplifies to three lines via anti-symmetry.

---

## History

- Original: Statement with hand-waved proof
- CR-039: Proof completed (but used incorrect ΔI definition)
- Session 196: Corrected to use revised DEF_0227; proof simplified via anti-symmetry; added complementary overlap-loss argument
