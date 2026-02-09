# THM_0493: Linear Unitary Evolution

**Status**: DERIVATION
**Layer**: 1
**Created**: Session 66, formalized Session 144

---

## Statement

Content conservation (||psi||^2 = const) together with Stone's theorem forces evolution operators to take the form:

```
T(s) = exp(-isH)

where H is Hermitian (H^dag = H)
```

This gives the Schrodinger equation form: i d/ds |psi> = H |psi>.

**Sign convention**: T(s) = exp(-isH) [physics convention]. Then dpsi/ds = -iH psi, so i dpsi/ds = H psi. The original SKETCH had exp(+isH), which gives the opposite sign on H.

## Proof Sketch

### Given
- THM_0491: V_pi is a finite-dimensional Hilbert space over C
- AXM_0115 (T0): Transitions form a group under composition
- Content conservation: transitions preserve the inner product norm

### Derivation
1. Content conservation: ||T(s) psi||^2 = ||psi||^2 for all s [from THM_0450 + A-PHYSICAL]
2. This means T(s) is unitary: T(s)^dag T(s) = I
3. T(0) = I and T(s+t) = T(s)T(t) [group property from AXM_0115]
4. T: R -> U(n_d) is a group homomorphism. In finite dimensions, U(n_d) is a Lie group. By automatic continuity [I-MATH: Weil 1940], any measurable homomorphism R -> U(n) is smooth. Physical evolution is measurable (excludes only AC pathologies). Therefore T is smooth.
5. By Stone's theorem [I-MATH, finite-dim form]: smooth one-parameter unitary group -> T(s) = exp(-isH)
6. Differentiating T^dag T = I at s=0: H^dag = H (Hermitian generator)
7. Differentiating psi(s) = T(s)psi(0): i d/ds |psi> = H |psi>

## Dependencies

| Dependency | Type | Role |
|-----------|------|------|
| THM_0491 | [D] | V_π is a finite-dimensional Hilbert space over C |
| AXM_0115 | [A-AXIOM] | Transitions form a group under composition (T0) |
| Content conservation | [D] | Transitions preserve inner product norm |
| Measurability of T(s) | [A-STRUCTURAL] | Physically trivial — excludes only AC pathologies. Continuity then follows from automatic continuity in finite dim (Weil 1940). CR-037 resolved. |
| Continuous parameter s | [A-STRUCTURAL] | Transition parameter assumed continuous; axioms define discrete structure |
| Stone's theorem | [I-MATH] | Continuous one-parameter unitary group → exponential form |

## Verification

**Script**: `verification/sympy/hilbert_unitary_chain.py` — 18/18 PASS (Parts 3-8)

Verified: Lie algebra structure, one-parameter subgroup properties, group property T(s+t)=T(s)T(t), continuity/smoothness, generator recovery via matrix logarithm, norm preservation (200 random tests), ODE integration matching matrix exponential, sign convention consistency.

## Implications

> **[LAYER 2/3 CORRESPONDENCE]**: Physical interpretation requires Layer 2 correspondence rules. The unitary evolution form T(s) = exp(isH) is Layer 1 mathematics; identification with the Schrödinger equation is Layer 2/3.

- [LAYER 1] Evolution operators take the form T(s) = exp(isH) with Hermitian H
- [LAYER 1] Factor i is forced by unitarity, not introduced by hand
- [LAYER 1] Hermiticity of H is a consequence, not an assumption
- [LAYER 2/3] Schrödinger equation emerges from axioms (form derived, ℏ value empirical) [A-PHYSICAL]

## Open Gaps

- ~~**Continuity assumption (CR-037)**~~: **RESOLVED**. In finite dimensions, U(n_d) is a Lie group. By automatic continuity (Weil 1940, von Neumann 1929), any measurable group homomorphism R -> U(n) is automatically smooth. Physical evolution is measurable (the alternative requires axiom-of-choice pathologies). Therefore continuity follows from measurability, which is physically trivial. Stone's theorem applies without additional assumptions.
- **Continuous parameter s**: The existence of a continuous parameter s is an [A-STRUCTURAL] import. The axioms define discrete structure; the continuous parameter enters at the correspondence level.
- **ℏ value**: The equation form i dpsi/ds = H psi is derived; the identification s = t/ℏ with physical time requires ℏ [A-IMPORT].

## Assumption Classification (Session 185 Audit)

| Component | Classification | Notes |
|-----------|---------------|-------|
| V_π is Hilbert space | [D] from THM_0491 | CANONICAL |
| Transitions form group | [A-AXIOM] AXM_0115 | Algebraic completeness |
| Content conservation → norm preservation | [D] THM_0450 + [A-PHYSICAL] | THM_0450 is CANONICAL; identification of "information content" with inner product norm is Layer 2 |
| Continuous parameter s | [A-STRUCTURAL] | **Irreducible gap**: Axioms define discrete transitions. Continuous s is needed for Stone's theorem. Not derivable from axioms. |
| Measurability of T(s) | [A-STRUCTURAL] (trivial) | CR-037 RESOLVED: automatic continuity in finite dim (Weil 1940). Excludes only axiom-of-choice pathologies. |
| Stone's theorem | [I-MATH] | Standard result for one-parameter unitary groups |
| ℏ identification | [A-IMPORT] | s = t/ℏ bridges to physical time |

### Honest Assessment (Session 185)

**Status: DERIVATION — at ceiling.** Cannot promote to CANONICAL because:

1. **Continuous parameter s** is [A-STRUCTURAL]: The axioms (AXM_0100-0119) define discrete structure. The existence of a continuous evolution parameter is a structural assumption about the transition family, not derivable from the axioms. This is the single irreducible gap.

2. **Norm = content** is [A-PHYSICAL]: THM_0450 proves information is conserved. The identification of "information" with "||ψ||²" is a Layer 2 correspondence rule, not a mathematical theorem.

**What would promote to CANONICAL**: Derive the continuous parameter from the axioms (e.g., show that the discrete transition group embeds into a continuous one-parameter group by some density argument), or add an explicit axiom for continuous transitions.

**What IS at THEOREM level**: Given a finite-dimensional Hilbert space and a continuous one-parameter unitary group, the generator is Hermitian and the evolution is exponential. This is standard mathematics (Stone's theorem in finite dimensions). The framework contribution is providing the Hilbert space (THM_0491) and the unitarity (THM_0450).

## Promotion History

- Session 144: Created as SKETCH (from S66 derivation)
- Session 172+: Promoted to DERIVATION. CR-037 resolved via automatic continuity in finite dimensions. Sign convention corrected to physics standard. Script `hilbert_unitary_chain.py` (18/18 PASS) confirms.
- Session 185: Assessed for CANONICAL promotion — stays at DERIVATION (continuous parameter s is irreducible structural assumption). Assumption classification added.

## Source

`framework/investigations/quantum/schrodinger_derivation.md` (Sections 5.1-5.4)
