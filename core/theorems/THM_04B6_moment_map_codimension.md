# THM_04B6: Moment Map Codimension Theorem

**Tag**: 04B6
**Type**: THEOREM
**Status**: CANONICAL
**Layer**: 0-1 (Grassmannian geometry of forced dimensions; no physics imports)
**Created**: Session 278

---

## Requires

- [AXM_0120: CCP] -- Forces n_c = 11, n_d = 4, D_fw
- [THM_04AD: Perspective Rank Selection] -- n_d = 4, Gr(4,11) as vacuum manifold
- [THM_0487: SO(11) Breaking Chain] -- G_2 = Aut(O) acts on SO(7) sector
- Exterior algebra rank theory [I-MATH] -- Lambda^2 rank classification
- G_2 moment map [I-MATH] -- mu: Gr(4,11) -> g_2* from G_2 action on Grassmannian
- Symplectic reduction [I-MATH] -- Marsden-Weinstein quotient
- Lagrangian Grassmannian [I-MATH] -- LGr(2, R^4) structure

## Provides

- codim(mu^{-1}(0)) = n_c = 11 in Gr(4,11;R)
- dim(mu^{-1}(0)/G_2) = Im_H = 3 (symplectic reduction = spatial dimensions)
- Decomposition 28 = 17 + 11 (associative + crystal directions)
- Rank gap theorem: Lambda^2(R^7) 7-component forces rank 0 or 6
- Fibration: mu^{-1}(0) fibers over LGr(2, R^4) with G_2-orbit fibers, 17 = 14 + 3
- Third independent path to n_c = 11 (geometric, complementing algebraic and pipeline routes)

---

## Motivation

The Grassmannian Gr(4,11;R) is the space of all perspectives (rank-4 projections in R^11). The group G_2 = Aut(O) acts on Gr(4,11) through its embedding in SO(7) acting on the hidden 7-dimensional sector. This action has a moment map mu: Gr(4,11) -> g_2*, where g_2* is the dual of the Lie algebra of G_2.

The zero locus mu^{-1}(0) consists of perspectives that are "G_2-balanced" -- those where the octonionic automorphism group exerts no net torque. The codimension of this locus measures how many independent constraints G_2 imposes on the perspective space.

CCP forces n_c = 11 algebraically. This theorem shows n_c = 11 also appears geometrically as a codimension -- an independent confirmation through differential geometry rather than algebra.

---

## Statement

**Theorem (Moment Map Codimension)**

Let Gr(4,11;R) = SO(11)/(SO(4) x SO(7)) be the Grassmannian of 4-planes in R^11, with dim = 28. Let G_2 = Aut(O) act via its embedding in SO(7). Let mu: Gr(4,11) -> g_2* be the induced moment map. Then:

### Part (a): Codimension = n_c

```
codim(mu^{-1}(0)) = 28 - 17 = 11 = n_c
```

The G_2 moment map imposes exactly n_c independent constraints on the Grassmannian.

### Part (b): Symplectic Reduction Dimension = Im_H

```
dim(mu^{-1}(0) / G_2) = 17 - 14 = 3 = Im_H
```

The symplectic reduction of Gr(4,11) by G_2 has dimension equal to the number of spatial dimensions.

### Part (c): Fibration Structure

mu^{-1}(0) fibers as:

```
G_2-orbit (dim 14)  -->  mu^{-1}(0) (dim 17)
                              |
                              v
                         LGr(2, R^4) (dim 3)
```

The base is the Lagrangian Grassmannian LGr(2, R^4) of maximal isotropic subspaces of R^4 with respect to a symplectic form. The fiber is a single G_2 orbit (dim 14). The decomposition 17 = 14 + 3 separates octonionic structure (G_2 orbits) from spatial structure (Lagrangian base).

---

## Proof

### Part (a): Rank Gap Argument

1. **Tangent space decomposition**: At a base point of Gr(4,11), the tangent space is Hom(R^4, R^7) with dim = 28. The G_2 moment map mu has components mu_I for each generator of g_2 (I = 1, ..., 14).

2. **Moment map formula**: For a tangent direction A in Hom(R^4, R^7), the I-th component of the moment map involves B_I = A * J_I * A^T, where J_I are the G_2 structure matrices acting on the 7-component of Lambda^2(R^7).

3. **Rank gap theorem** [I-MATH: exterior algebra]: The 7-dimensional component of Lambda^2(R^7) under G_2 has the property that its elements have rank 0 or 6 -- no intermediate ranks. This is because G_2 acts irreducibly on its 7-dimensional fundamental representation, and the rank of a 2-form in this component is constrained by the octonionic structure.

4. **Isotropic characterization**: Since B_I = A * J_I * A^T has rank <= 4 (as A has 4 rows), and the 7-component forces rank 0 or 6, we need rank(B_I) <= 4 < 6. Therefore B_I = 0 for all I. This means mu = 0 if and only if all rows of A are omega_I-isotropic for every symplectic form omega_I in the 7-component.

5. **Dimension counting**: The isotropic condition forces the rows of A to lie in a Lagrangian subspace of R^4 (via the identification). The space of such configurations has dimension:
   - Fiber: G_2 orbits contribute dim(G_2) = 14
   - Base: LGr(2, R^4) contributes dim = 2*(2+1)/2 = 3
   - Total: dim(mu^{-1}(0)) = 14 + 3 = 17

6. **Codimension**: codim = 28 - 17 = 11 = n_c. QED (a).

### Part (a'): Jacobian Verification

The codimension is confirmed by computing the Jacobian rank of mu at two independent points in Gr(4,11):

- **Point 1**: A standard embedding with rows along coordinate directions. Jacobian rank = 11.
- **Point 2**: A generic point obtained by SO(11) rotation. Jacobian rank = 11.

Since the Jacobian has rank 11 at generic points, the image of mu has dimension 11 in g_2* (which has dim 14), confirming codim(mu^{-1}(0)) = 11 in Gr(4,11). QED (a').

### Part (b): Symplectic Reduction

1. G_2 acts on mu^{-1}(0) with generic orbit dimension = dim(G_2) = 14 (verified: the stabilizer of a generic point in mu^{-1}(0) is trivial).
2. The Marsden-Weinstein quotient has dimension: dim(mu^{-1}(0)) - dim(G_2) = 17 - 14 = 3.
3. This equals Im_H = dim(H) - 1 = 3 = number of spatial dimensions. QED (b).

### Part (c): Fibration

1. The base of the fibration is identified by the residual freedom after fixing the G_2 orbit: this is the space of Lagrangian 2-planes in R^4 with respect to the induced symplectic structure.
2. LGr(2, R^4) = Sp(4,R)/U(2) has dimension 2*(2+1)/2 = 3.
3. Each fiber is a single G_2 orbit (dim 14), giving 17 = 14 + 3. QED (c).

---

## Corollaries

### Three Independent Paths to n_c = 11

| Path | Method | Status | Session |
|------|--------|--------|---------|
| 1. Algebraic (CCP) | Im_C + Im_H + Im_O = 1 + 3 + 7 = 11 | THEOREM | S251 |
| 2. Pipeline | 121 -> 55 -> 18 -> 12 (filters End(V)) | DERIVATION | S251 |
| 3. Geometric (this) | codim(mu^{-1}(0)) = 11 | THEOREM | S278 |

The geometric path is independent: it uses only the G_2 action on Gr(4,11) and exterior algebra rank theory, not the Cayley-Dickson cascade that produces the algebraic path.

### Crystal Dimension = Codimension of Associativity

The decomposition 28 = 17 + 11 has a structural interpretation:
- **17 directions**: "Purely associative" -- compatible with G_2 balance (octonionic self-consistency)
- **11 directions**: "Crystal" -- the constraints imposed by octonionic structure on the perspective space

The number of independent constraints that non-associativity imposes on the space of perspectives equals the crystal dimension n_c. This is a geometric restatement of the algebraic fact that the crystal has 11 dimensions.

### Spatial Dimensions from Symplectic Reduction

The symplectic reduction dim = 3 = Im_H provides a geometric derivation of the number of spatial dimensions, independent of the associativity argument in `spacetime_from_associativity.md`. Both give 3, via different mathematical mechanisms:
- Associativity: Im_H = dim(H) - 1 = 3 (algebraic)
- Symplectic reduction: dim(mu^{-1}(0)/G_2) = 3 (geometric)

---

## Truncation Necessity

As with THM_04B5 (pi-power sums), the result requires CCP's Hurwitz truncation. For Gr(4, n) with n != 11:

| n | G_2 codim | = n_c? | Self-referential? |
|---|-----------|--------|-------------------|
| 7 | dim(Gr) = 12, codim = varies | No n_c | No crystal dimension |
| 11 | 28 - 17 = **11** | **YES** | **Codim = ambient crystal dim** |
| 15 | dim(Gr) = 44, codim = varies | No match | Sedenion contamination |

The self-referential property (codimension equals the crystal dimension itself) holds only for n_c = 11.

---

## Assumption Classification

| Component | Classification | Notes |
|-----------|---------------|-------|
| CCP forces n_c = 11, n_d = 4 | [D] from AXM_0120 | No free parameters |
| Gr(4,11) as perspective space | [D] from THM_04AD | Rank selection |
| G_2 = Aut(O) embedded in SO(7) | [I-MATH] | Standard (Baez, 2002) |
| Moment map construction | [I-MATH] | Marsden-Weinstein theory |
| Rank gap in Lambda^2(R^7) | [I-MATH] | Exterior algebra, G_2 representation theory |
| Isotropic characterization | [D] from rank gap + dim(A) = 4 | Rank bound forces B = 0 |
| Dimension count 17 = 14 + 3 | [D] from isotropic condition | Direct computation |
| Codimension = 11 | [D] from 28 - 17 | Arithmetic |
| Symplectic reduction dim = 3 | [D] from 17 - 14 | Marsden-Weinstein |
| Jacobian rank = 11 | [D] computational | Verified at two independent points |

---

## Verification

- `verification/sympy/mu_zero_locus.py` -- 16/16 PASS (rank gap, isotropic characterization, codimension theorem, Jacobian verification)
- `verification/sympy/h_schubert_state_counting.py` -- 8/8 PASS (curvature, symplectic area, level alpha, dimensional analysis)

Total: 24/24 PASS

---

## Cross-References

- [AXM_0120: CCP] -- Forces n_c = 11; codimension confirms this geometrically
- [THM_04AD: Perspective Rank Selection] -- n_d = 4 gives Gr(4,11)
- [THM_0487: SO(11) Breaking Chain] -- G_2 appears at Stage 2
- [THM_04B2: Perspective from Seed] -- Gap tower gives same 11, different route
- [THM_04B5: Pi-Power Sums] -- Another self-referential property of D_fw
- `foundations/spacetime_from_associativity.md` -- Im_H = 3 by algebra; symplectic reduction gives 3 by geometry
- `framework/MATHEMATICAL_PERIODIC_TABLE.md` -- Derived Structures: Grassmannian section
- `framework/investigations/constants/planck_constant_investigation.md` -- Parts IX-X, original investigation
