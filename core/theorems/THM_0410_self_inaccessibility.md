# THM_0410 Theorem: Self-Inaccessibility

**Tag**: 0410
**Type**: THEOREM
**Status**: CANONICAL (upgraded from SKETCH, Session 188)
**Source**: framework/layer_0_pure_axioms.md (projection formulation)

---

## Requires

- [DEF_0210: Perspective pi (orthogonal projection)]
- [DEF_02C5: Self-Model M_pi]
- [DEF_02C6: Incompleteness Gap G_pi]
- [AXM_0104: Partiality (P1)]
- [AXM_0102: Non-Triviality (P2)]

## Provides

- Perspectives cannot fully access themselves
- Blind spots are invisible from within
- No self-reconstruction of the gap is possible

---

## Statement

**Theorem P.1 (Self-Inaccessibility)**

Let pi be a perspective (orthogonal projection on V_Crystal satisfying P1-P3). Then:

**(a) Non-trivial kernel**: ker(pi) != {0}. The perspective has blind spots.

**(b) Invisibility of blind spots**: For any v in V_Crystal and any w in ker(pi):

```
pi(v + w) = pi(v)
```

The perspective cannot distinguish v from v + w. Blind spots are invisible from within.

**(c) No self-reconstruction**: No map f: V_pi -> V_Crystal recoverable from pi alone can reconstruct ker(pi). Specifically, for any f that depends only on pi's outputs (i.e., f factors through pi), im(f) is contained in V_pi, and ker(pi) intersect V_pi = {0}.

---

## Proof

### Part (a): Non-trivial kernel

1. By AXM_0104 (Partiality): V_pi = im(pi) is a PROPER subspace of V_Crystal.
2. Therefore V_pi != V_Crystal.
3. Since pi is an orthogonal projection: ker(pi) = V_pi^perp [I-MATH: spectral theorem for projections].
4. V_pi proper implies V_pi^perp != {0} [I-MATH: orthogonal complement of proper subspace in inner product space].
5. Therefore ker(pi) != {0}. QED (a).

### Part (b): Invisibility of blind spots

1. Let v in V_Crystal, w in ker(pi).
2. By definition of kernel: pi(w) = 0.
3. By linearity of pi: pi(v + w) = pi(v) + pi(w) = pi(v) + 0 = pi(v).
4. Therefore pi(v + w) = pi(v) for all w in ker(pi). QED (b).

### Part (c): No self-reconstruction

1. Any map f recoverable from pi alone depends only on pi's outputs, which lie in V_pi = im(pi).
2. More precisely: if f = g . pi for some map g (f factors through pi), then for any v in V_Crystal, f(v) = g(pi(v)).
3. Since pi(v) in V_pi for all v, f's outputs are determined entirely by V_pi-valued inputs.
4. Now ker(pi) = V_pi^perp, so ker(pi) intersect V_pi = {0} [I-MATH: orthogonality].
5. No non-zero element of ker(pi) lies in V_pi.
6. Therefore no function of pi's outputs can produce a non-zero element of ker(pi).
7. In particular, f cannot map any V_pi element to a non-zero element of ker(pi), since V_pi and ker(pi) are orthogonal complements with zero intersection.
8. Therefore ker(pi) is not reconstructable from pi alone. QED (c).

---

## Corollary (Old Formulation)

Under the older triple formulation pi = (p, D, A) where A is the access map:

```
p not in im(A)
```

This follows because the anchor point p's kernel-component (its projection onto G_pi = ker(pi)) is inaccessible. The access map A, being derived from pi, cannot recover information in ker(pi) by part (c). The anchor point's "self" includes kernel-component information that A cannot reach.

**Note**: The projection formulation is more general — it makes no reference to a specific anchor point and applies to the perspective operator as a whole.

---

## Verification

**Script**: `verification/sympy/self_inaccessibility_proof.py` — 5/5 PASS

Tests:
1. For random projection P (rank k < n), ker(P) != {0}
2. For v and v+w where w in ker(P), P*v = P*(v+w)
3. Orthogonal decomposition: im(P) + ker(P) = V
4. P restricted to im(P) is identity
5. dim(ker(P)) = n - k > 0

---

## Implications

- Every perspective has aspects of V_Crystal that are fundamentally inaccessible to it
- Different perspectives have different gaps — what one misses, another may see
- Self-knowledge is necessarily incomplete (formalized in THM_04A7)
- The gap is well-defined and non-paradoxical (formalized in THM_04A9)
- This is the framework's analog of Godelian incompleteness (see investigation: `godel_self_inaccessibility.md`)

---

## Assumption Classification

| Component | Classification | Notes |
|-----------|---------------|-------|
| pi is orthogonal projection | [A-AXIOM] DEF_0210 | Projection formulation |
| V_pi proper subspace | [A-AXIOM] AXM_0104 | Partiality |
| Linearity of pi | [I-MATH] | Property of linear operators |
| ker(pi) = V_pi^perp | [I-MATH] | Spectral theorem for projections |
| Orthogonal complement non-trivial | [I-MATH] | Standard linear algebra |

---

## Notes

**History**: Originally stated as "p not in im(A)" with an informal sketch proof (Session 140 audit downgraded to SKETCH). Session 188 rewrote using the projection formulation from `layer_0_pure_axioms.md`, providing a complete proof from AXM_0104.

**Significance**: This is one of the foundational results of the framework. It establishes that partial access necessarily creates blind spots, and that these blind spots are invisible from within the perspective. The result is purely mathematical (Layer 0) and requires no physics.

---

## Cross-References

- [DEF_02C5: Self-Model]
- [DEF_02C6: Incompleteness Gap]
- [THM_04A7: Self-Model Incompleteness]
- [THM_04A9: Non-Paradoxical Gap]
- [THM_04AA: Perspective from Self-Representation (conditional)]
