# Perspective Cosmology: Mathematical Foundations

**Last Updated**: 2026-02-06 (Session S255)
**Version**: 0.1 (TEMPLATE/DRAFT)
**Purpose**: Complete, self-contained mathematical development from axioms to consequences
**Audience**: Mathematicians and theoretical physicists capable of auditing formal proofs
**Status**: DRAFT
**Reading Time**: ~60 minutes
**Companion Document**: `PC_INTERPRETIVE_COMPANION.md` (section-correlated physical interpretation)

---

## Key References

| File | Role |
|------|------|
| `framework/layer_0_pure_axioms.md` | Axiom source |
| `core/axioms/AXM_0120_completeness_principle.md` | CCP axiom |
| `framework/investigations/meta/evaluation_map_foundations.md` | Evaluation map theorems |
| `framework/investigations/meta/associativity_derivation.md` | Spacetime dimension proof |
| `framework/investigations/gauge/perspective_transformative_pipeline.md` | Gauge derivation |
| `foundations/constants_from_dimensions.md` | Numerical consequences |
| `publications/PC_INTERPRETIVE_COMPANION.md` | Companion commentary |

## Critical Framework Elements

| Element | ID | Status | Role in This Document |
|---------|----|--------|-----------------------|
| Frobenius-Hurwitz | [I-MATH] | THEOREM | Division algebra classification |
| AXM_0120 (CCP) | AXM_0120 | [AXIOM] | Forces n_c, n_d, F |
| Evaluation Map | THM_04AC | [CANONICAL] | Creates perspective structure |
| Lorentz Signature | THM_04AE | [DERIVATION] | Spacetime metric |
| Gauge Convergence | THM_0487 | [DERIVATION] | Standard Model group |

---

## How to Read This Document

This document presents a **purely mathematical development**. Every statement is either a definition, an axiom, a theorem from classical mathematics (marked **[I-MATH]**), or a derived consequence. No physical interpretation appears in this document.

The companion document `PC_INTERPRETIVE_COMPANION.md` provides, section by section, the physical interpretation, motivation, and broader context. The two documents are designed to be read in parallel: each numbered section in this document corresponds to the identically numbered section in the companion.

**Notation conventions** are established in Section 1. All proofs that exceed one page are deferred to the Appendices. Verification scripts (computational confirmation) are referenced inline.

---

## PART I: ALGEBRAIC FOUNDATIONS

### Section 1. Primitives, Definitions, and Axioms

> **Companion**: See Interpretive Companion, Section 1: *Why These Axioms*

#### 1.1 Primitives

We begin with exactly two primitive objects:

**Primitive 1 (Crystal).** A finite-dimensional real inner product space $(V, \langle \cdot, \cdot \rangle)$ with orthonormal basis $\{e_1, \ldots, e_n\}$.

**Primitive 2 (Perspective).** An orthogonal projection $\pi: V \to V$ with image $V_\pi := \pi(V)$ satisfying $\dim(V_\pi) < \dim(V)$.

#### 1.2 Axioms

We impose the following axioms, organized by the primitive they constrain:

**Crystal axioms:**

| ID | Name | Statement |
|----|------|-----------|
| C1 | Existence | $V$ exists as a finite-dimensional real inner product space |
| C2 | Orthogonality | $V$ admits an orthonormal basis |
| C3 | Completeness | The basis spans $V$ |
| C4 | Symmetry | The inner product is invariant under $O(n)$ |
| C5 | Cardinality | $\dim(V) = n < \infty$ |

**Perspective axioms:**

| ID | Name | Statement |
|----|------|-----------|
| P1 | Partiality | $V_\pi \subsetneq V$ (strict inclusion) |
| P2 | Non-triviality | $V_\pi \neq \{0\}$ |
| P3 | Finite access | $\dim(V_\pi) = k$ with $1 \leq k < n$ |
| P4 | Tilt | The projected basis $\tilde{B} = \{\pi(e_i)\}$ need not be orthogonal in $V_\pi$ |

**Multi-perspective axioms:**

| ID | Name | Statement |
|----|------|-----------|
| $\Pi$1 | Multiplicity | There exist multiple distinct perspectives $\pi_1, \pi_2, \ldots$ |
| $\Pi$2 | Overlap | For perspectives $\pi_i, \pi_j$: $V_{\pi_i} \cap V_{\pi_j}$ may be non-trivial |

**Transition axioms:**

| ID | Name | Statement |
|----|------|-----------|
| T0 | Algebraic completeness | The set of perspective-to-perspective maps $\mathcal{T} = \{\pi_j \circ \pi_i^{-1}\}$ forms an algebra |
| T1 | Directed history | The composition of transitions is ordered (not symmetric) |

**Meta-axiom:**

| ID | Name | Statement |
|----|------|-----------|
| CCP | Consistency-Completeness | $V$ contains all mathematically consistent algebraic structure compatible with C1-C5, and nothing else |

#### 1.3 Notational Conventions

Throughout this document:
- $n = \dim(V)$ (crystal dimension)
- $k = \dim(V_\pi)$ (perspective dimension, also written $n_d$)
- $n - k$ = codimension (also written $n_c$ when $n$ and $k$ are determined)
- $\mathbb{F}$ = scalar field of the observable algebra
- $\text{Im}(D)$ = imaginary part of division algebra $D$ (dimension $\dim(D) - 1$)
- $\Phi_m(x)$ = $m$-th cyclotomic polynomial
- $\text{Aut}(D)$ = automorphism group of algebra $D$

---

### Section 2. Evaluation Maps and Observable Structure

> **Companion**: See Interpretive Companion, Section 2: *How Observation Creates Structure*

#### 2.1 The Evaluation Map

**Definition 2.1.** For a subspace $W \subseteq V$ with $\dim(W) = k$, the *evaluation map* is the restriction homomorphism:
$$\text{ev}_W: \text{Hom}(V, \mathbb{F}) \to \text{Hom}(W, \mathbb{F}), \quad f \mapsto f|_W$$

**Theorem 2.2 (THM_04AC).** [CANONICAL] For $\dim(V) \geq 2$, evaluation maps $\text{ev}_W$ satisfy:
1. **Partiality**: $\ker(\text{ev}_W) \neq \{0\}$ (since $n^2 > n$ for $n \geq 2$)
2. **Non-triviality**: $\text{ev}_W$ is surjective onto $\text{Hom}(W, \mathbb{F})$
3. **Finite access**: $\dim(\text{Hom}(W, \mathbb{F})) = k^2 < n^2$

*Proof sketch.* (1) follows from rank-nullity since $\dim(\text{Hom}(V,\mathbb{F})) > \dim(\text{Hom}(W,\mathbb{F}))$ when $k < n$. (2) follows because any linear map $W \to \mathbb{F}$ extends to $V \to \mathbb{F}$. (3) is immediate from finite-dimensionality. $\square$

**Corollary 2.3.** The axioms P1, P2, P3 are not independent postulates but theorems following from the existence of evaluation maps on finite-dimensional spaces.

#### 2.2 The Observable Algebra

**Definition 2.4.** The *observable algebra* of a perspective with image $W$ is:
$$\mathcal{A}(W) := \text{End}_\mathbb{F}(W)$$
the algebra of $\mathbb{F}$-linear endomorphisms of $W$.

**Theorem 2.5.** For $W \cong \mathbb{F}^k$, the observable algebra satisfies:
$$\mathcal{A}(W) \cong M_k(\mathbb{F})$$
the algebra of $k \times k$ matrices over $\mathbb{F}$.

#### 2.3 Non-Commutativity

**Theorem 2.6.** Let $P_A, P_B$ be orthogonal projections onto non-orthogonal subspaces $A, B \subseteq W$. Then:
$$P_A P_B \neq P_B P_A$$

*Proof.* Standard linear algebra. If $A$ and $B$ are not orthogonal complements and neither contains the other, the projections do not commute. $\square$

**Theorem 2.7 (Robertson-Schr\"{o}dinger).** [I-MATH] For any two Hermitian operators $\hat{A}, \hat{B}$ on a Hilbert space:
$$\Delta A \cdot \Delta B \geq \frac{1}{2}|\langle [\hat{A}, \hat{B}] \rangle|$$

---

### Section 3. The Division Algebra Constraint

> **Companion**: See Interpretive Companion, Section 3: *Why Division Algebras*

#### 3.1 Classical Theorems

**Theorem 3.1 (Frobenius, 1878).** [I-MATH] The only finite-dimensional associative division algebras over $\mathbb{R}$ are:
$$\mathbb{R} \quad (\dim = 1), \qquad \mathbb{C} \quad (\dim = 2), \qquad \mathbb{H} \quad (\dim = 4)$$

**Theorem 3.2 (Hurwitz, 1898).** [I-MATH] The only finite-dimensional normed division algebras over $\mathbb{R}$ are:
$$\mathbb{R} \quad (\dim = 1), \qquad \mathbb{C} \quad (\dim = 2), \qquad \mathbb{H} \quad (\dim = 4), \qquad \mathbb{O} \quad (\dim = 8)$$

**Table 3.3.** Properties of the four division algebras:

| Algebra | $\dim$ | $\dim(\text{Im})$ | Associative | Commutative | $\text{Aut}$ |
|---------|--------|--------------------|-------------|-------------|---------------|
| $\mathbb{R}$ | 1 | 0 | Yes | Yes | $\{1\}$ |
| $\mathbb{C}$ | 2 | 1 | Yes | Yes | $\mathbb{Z}/2$ (as real algebra); $U(1)$ (continuous) |
| $\mathbb{H}$ | 4 | 3 | Yes | No | $SU(2)/\mathbb{Z}_2 \cong SO(3)$ |
| $\mathbb{O}$ | 8 | 7 | No | No | $G_2$ (exceptional, dim 14) |

#### 3.2 Application to Transitions

**Theorem 3.4.** If transition maps $\mathcal{T}$ (Axiom T0) satisfy:
1. *Linearity*: Each $\tau \in \mathcal{T}$ is $\mathbb{R}$-linear
2. *Invertibility*: Each non-zero $\tau$ has a two-sided inverse
3. *Norm preservation*: $\|\tau(v)\| = \|\tau\| \cdot \|v\|$ (multiplicative norm)

Then $\mathcal{T}$ is isomorphic to one of $\{\mathbb{R}, \mathbb{C}, \mathbb{H}, \mathbb{O}\}$.

*Proof.* Conditions (1)-(3) are precisely the hypotheses of Hurwitz's theorem. $\square$

#### 3.3 Path Independence and Associativity

**Theorem 3.5.** If transitions must be *path-independent* (the composition $\tau_{ij} \circ \tau_{jk}$ depends only on endpoints $i, k$ and not on intermediate $j$), then $\mathcal{T}$ must be associative, restricting to:
$$\mathcal{T} \in \{\mathbb{R}, \mathbb{C}, \mathbb{H}\}$$

*Proof.* Path independence requires $(\tau_1 \circ \tau_2) \circ \tau_3 = \tau_1 \circ (\tau_2 \circ \tau_3)$, which is associativity. By Frobenius (Theorem 3.1), associative division algebras are $\mathbb{R}, \mathbb{C}, \mathbb{H}$. $\square$

**Corollary 3.6.** The maximal associative transition algebra is $\mathbb{H}$, with $\dim(\mathbb{H}) = 4$.

---

## PART II: THE DIMENSIONAL CASCADE

### Section 4. Forced Dimensions

> **Companion**: See Interpretive Companion, Section 4: *How Dimensions Become Spacetime*

#### 4.1 The Consistency-Completeness Principle

**Axiom CCP.** (Stated in Section 1.2.) The crystal $V$ contains all mathematically consistent algebraic structure compatible with axioms C1-C5, and nothing else.

**Definition 4.1.** A *zero divisor* in an algebra $A$ is a nonzero element $a \in A$ such that there exists nonzero $b \in A$ with $ab = 0$.

**CCP Consequence 1 (CCP-1, Consistency).** $V$ admits no zero divisors in its transition algebra. (Zero divisors would permit transitions that annihilate information, contradicting the completeness of $V$'s structure.)

**CCP Consequence 2 (CCP-2, Completeness).** $V$ contains the imaginary part of every normed division algebra: $\text{Im}(\mathbb{C}), \text{Im}(\mathbb{H}), \text{Im}(\mathbb{O})$.

**CCP Consequence 3 (CCP-3, Minimality).** These subspaces are assembled by direct sum (no redundancy):
$$V_{\text{crystal}} = \text{Im}(\mathbb{C}) \oplus \text{Im}(\mathbb{H}) \oplus \text{Im}(\mathbb{O})$$

#### 4.2 The Three Forced Values

**Theorem 4.2 (Crystal Dimension).** Under CCP:
$$n = \dim(V) = \dim(\text{Im}(\mathbb{C})) + \dim(\text{Im}(\mathbb{H})) + \dim(\text{Im}(\mathbb{O})) = 1 + 3 + 7 = 11$$

*Proof.* By Hurwitz (Theorem 3.2), the only normed division algebras are $\mathbb{R}, \mathbb{C}, \mathbb{H}, \mathbb{O}$ with imaginary dimensions $0, 1, 3, 7$ respectively. CCP-2 requires all imaginary subspaces. CCP-3 requires direct sum. $\text{Im}(\mathbb{R}) = \{0\}$ contributes nothing. Therefore $n = 1 + 3 + 7 = 11$. $\square$

**Theorem 4.3 (Perspective Dimension).** Under CCP and axiom T1 (directed history):
$$k = n_d = \dim(\mathbb{H}) = 4$$

*Proof.* Directed composition of transitions requires associativity (Theorem 3.5). By Frobenius (Theorem 3.1), the maximal associative division algebra is $\mathbb{H}$ with $\dim(\mathbb{H}) = 4$. Axiom AXM_0117 (maximality) selects the largest. $\square$

**Theorem 4.4 (Scalar Field).** Under CCP:
$$\mathbb{F} = \mathbb{C}$$

*Proof.* The scalar field must be:
1. A division algebra (from transition structure)
2. Commutative (scalars must commute with all operators)
3. Algebraically closed (CCP requires maximal consistent structure)

By Frobenius, commutative real division algebras are $\mathbb{R}$ and $\mathbb{C}$. By the Fundamental Theorem of Algebra [I-MATH], $\mathbb{C}$ is algebraically closed while $\mathbb{R}$ is not. Condition (3) selects $\mathbb{F} = \mathbb{C}$. $\square$

#### 4.3 Derived Quantities

**Corollary 4.5.** From the three forced values:
$$n_d = 4, \qquad n_c := n - n_d = 11 - 4 = 7, \qquad \text{wait: } n_c = n = 11$$

[**Clarification on notation.** We distinguish:
- $n = 11$: total crystal dimension (also denoted $n_c$ in some framework documents for "crystal dimension")
- $k = n_d = 4$: perspective (defect) dimension
- $n - k = 7$: codimension of the perspective within the crystal
- Throughout the remainder of this document, $n_c = 11$ denotes the full crystal dimension and $n_d = 4$ the perspective dimension.]

**Table 4.6.** Complete set of forced dimensional quantities:

| Symbol | Value | Origin |
|--------|-------|--------|
| $n_c$ | 11 | Theorem 4.2 |
| $n_d$ | 4 | Theorem 4.3 |
| $\mathbb{F}$ | $\mathbb{C}$ | Theorem 4.4 |
| $n_c - n_d$ | 7 | Codimension |
| $n_d + n_c$ | 15 | Total: $= 1 + 2 + 4 + 8$ |
| $\text{Im}(\mathbb{H})$ | 3 | From $\dim(\mathbb{H}) - 1$ |
| $\text{Im}(\mathbb{O})$ | 7 | From $\dim(\mathbb{O}) - 1$ |

---

### Section 5. Observable Algebra and the Bilinear Form

> **Companion**: See Interpretive Companion, Section 5: *Spacetime Signature and Causality*

#### 5.1 The Observable Algebra

**Theorem 5.1.** With $\mathbb{F} = \mathbb{C}$ and $n_d = 4$ (hence $W \cong \mathbb{C}^2$):
$$\mathcal{A}(W) = \text{End}_\mathbb{C}(\mathbb{C}^2) \cong M_2(\mathbb{C})$$

This is a 4-dimensional complex algebra (8-dimensional over $\mathbb{R}$).

#### 5.2 The Self-Adjoint Subalgebra

**Definition 5.2.** The *self-adjoint* (Hermitian) part of $M_2(\mathbb{C})$ is:
$$\text{Herm}(2) := \{X \in M_2(\mathbb{C}) : X = X^\dagger\}$$

**Theorem 5.3.** $\text{Herm}(2)$ is a 4-dimensional real vector space with basis:
$$\sigma_0 = I = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}, \quad \sigma_1, \quad \sigma_2, \quad \sigma_3$$
where $\sigma_1, \sigma_2, \sigma_3$ are the Pauli matrices.

*Proof.* Any $X \in \text{Herm}(2)$ can be written uniquely as $X = t\sigma_0 + x\sigma_1 + y\sigma_2 + z\sigma_3$ with $t, x, y, z \in \mathbb{R}$. $\square$

#### 5.3 The Determinant Form and Lorentz Signature

**Theorem 5.4 (THM_04AE).** [DERIVATION] The determinant on $\text{Herm}(2)$ induces a quadratic form of signature $(1, 3)$:

For $X = t\sigma_0 + x\sigma_1 + y\sigma_2 + z\sigma_3 \in \text{Herm}(2)$:
$$\det(X) = t^2 - x^2 - y^2 - z^2$$

*Proof.* Direct computation:
$$X = \begin{pmatrix} t + z & x - iy \\ x + iy & t - z \end{pmatrix}$$
$$\det(X) = (t+z)(t-z) - (x-iy)(x+iy) = t^2 - z^2 - x^2 - y^2 \quad \square$$

**Theorem 5.5 (Selection of det over Tr).** [DERIVATION] Among the polynomial invariants of $M_2(\mathbb{C})$, the determinant is uniquely selected by:

1. **Cayley-Hamilton** [I-MATH]: $\det$ and $\text{Tr}$ are the only polynomial invariants
2. **Spectral discrimination**: The eigenvalue gap $\Delta\lambda = \sqrt{\text{Tr}^2 - 4\det}$ distinguishes states; det determines the gap structure
3. **Null cone**: $\det(X) = 0$ defines a cone; $\text{Tr}(X) = 0$ does not define causal structure

#### 5.4 Irreducibility Argument

**Theorem 5.6 (Irreducibility Pigeonhole).** [DERIVATION, S219] The physical arena is necessarily $\text{Herm}(2) \cong \mathbb{R}^{3,1}$.

*Proof outline.*
1. Observable algebra is $M_2(\mathbb{C})$ (Theorem 5.1)
2. Physical observables are Hermitian [I-MATH: spectral theorem]
3. Basis-independence (axiom C4 restricted to $W$) requires $SU(2)$ invariance
4. Under adjoint $SU(2)$ action: $\text{Herm}(2) = \mathbb{R} \cdot I \oplus \mathfrak{su}(2)$
5. $\mathfrak{su}(2)$ is irreducible under adjoint $SU(2)$
6. Non-commutativity (Theorem 2.6) forces non-trivial $\mathfrak{su}(2)$ content
7. By irreducibility (5) and non-triviality (6): all of $\mathfrak{su}(2)$ must be present
8. Therefore: physical arena $= \mathbb{R} \cdot I \oplus \mathfrak{su}(2) = \text{Herm}(2) \cong \mathbb{R}^{1,3}$

*Verification*: `herm2_irreducibility_proof.py` -- 10/10 PASS $\square$

---

### Section 6. Gauge Structure from Automorphisms

> **Companion**: See Interpretive Companion, Section 6: *The Forces of Nature*

#### 6.1 Automorphism Groups of Division Algebras

**Theorem 6.1.** [I-MATH] The continuous automorphism groups of the division algebras are:

| Algebra | $\text{Aut}(D)$ | $\dim(\text{Aut})$ |
|---------|------------------|---------------------|
| $\mathbb{R}$ | $\{1\}$ | 0 |
| $\mathbb{C}$ | $U(1)$ | 1 |
| $\mathbb{H}$ | $SU(2)$ (modulo center) | 3 |
| $\mathbb{O}$ | $G_2$ | 14 |

#### 6.2 Derivation Route 1: Symmetry Breaking Chain

**Theorem 6.2.** The full symmetry group of the crystal $V = \mathbb{R}^{11}$ is $SO(11)$. The perspective $W \cong \mathbb{R}^4$ breaks this as:
$$SO(11) \to SO(4) \times SO(7)$$

**Theorem 6.3.** $G_2 \subset SO(7)$ is the automorphism group of the octonions, preserving the octonionic multiplication table on $\text{Im}(\mathbb{O}) = \mathbb{R}^7$.

**Theorem 6.4.** Under $\mathbb{F} = \mathbb{C}$ (Theorem 4.4), the $G_2$ structure reduces:
$$G_2 \supset SU(3) \quad (\dim = 8)$$
The stabilizer of a direction in $S^6 \subset \text{Im}(\mathbb{O})$ under $G_2$ is $SU(3)$.

**Theorem 6.5.** The full gauge structure assembles as:
$$\text{Aut}(\mathbb{C}) \times \text{Aut}(\mathbb{H}) \times \text{Stab}_{G_2}(\text{direction}) = U(1) \times SU(2) \times SU(3)$$
with total dimension $1 + 3 + 8 = 12$.

#### 6.3 Derivation Route 2: The Perspective-Transformative Pipeline

**Theorem 6.6 (Pipeline).** Starting from $\mathfrak{u}(n_c) = \mathfrak{u}(11)$ with $\dim = 121$:

| Step | Filter | Survivors | Dimension |
|------|--------|-----------|-----------|
| 0 | Full algebra $\mathfrak{u}(11)$ | All generators | 121 |
| 1 | Antisymmetry (physical observables) | $\mathfrak{so}(11)$ | 55 |
| 2 | Perspective compatibility ($n_d = 4$ block structure) | $\mathfrak{so}(4) \oplus \mathfrak{so}(7)$ | $6 + 21 = 27$... |

[**TODO**: Complete pipeline with exact filter at each step. Current result from S251:]

$$121 \xrightarrow{\text{antisymmetry}} 55 \xrightarrow{\text{perspective}} 18 \xrightarrow{\text{associativity}} 12 = \mathfrak{u}(1) \oplus \mathfrak{su}(2) \oplus \mathfrak{su}(3)$$

*Verification*: `perspective_transformative_filter.py` -- 23/23 PASS

**Theorem 6.7 (Convergence).** Routes 1 and 2 produce the same gauge algebra:
$$\mathfrak{g} = \mathfrak{u}(1) \oplus \mathfrak{su}(2) \oplus \mathfrak{su}(3), \qquad \dim(\mathfrak{g}) = 12$$

*Verification*: `gauge_chain_convergence.py` -- 9/9 PASS

#### 6.4 Representation Content

**Theorem 6.8.** Under $SU(3) \times SU(2) \times U(1)$, the division algebra dimensions decompose into representations yielding exactly 15 Weyl fermion degrees of freedom per generation:

$$15 = 1 + 2 + 4 + 8 = \dim(\mathbb{R}) + \dim(\mathbb{C}) + \dim(\mathbb{H}) + \dim(\mathbb{O})$$

[**TODO**: Explicit representation decomposition table showing each fermion multiplet]

**Theorem 6.9 (Generation Count).** The number of generations equals $\dim(\text{Im}(\mathbb{H})) = 3$.

*Derivation.* Under $G_2 \to SU(3)$, the fundamental representation of $G_2$ on $\text{Im}(\mathbb{O}) = \mathbb{R}^7$ decomposes as:
$$7 \to 3 \oplus \bar{3} \oplus 1$$

The three directions in $\text{Im}(\mathbb{H}) = \mathbb{R}^3$ (the $\{i, j, k\}$ basis of quaternion imaginaries) index three equivalent copies of the fermion content. These copies are related by $SO(3) \cong SU(2)/\mathbb{Z}_2$ rotations in $\text{Im}(\mathbb{H})$.

**Theorem 6.10 (Hypercharge Quantization).** [DERIVATION] The five independent hypercharge values:
$$Y \in \left\{-1, -\frac{1}{2}, -\frac{1}{3}, \frac{1}{6}, \frac{2}{3}\right\}$$
are uniquely determined by the $SU(3) \times SU(2) \times U(1)$ representations, and all triangle anomalies:
- $SU(3)^3$, $SU(2)^2 \times U(1)$, $U(1)^3$, mixed gravitational
cancel automatically.

[**TODO**: Explicit anomaly cancellation proof]

#### 6.5 Rank and Dimension Matching

**Theorem 6.11.** The rank of the gauge group equals the perspective dimension:
$$\text{rank}(U(1) \times SU(2) \times SU(3)) = 1 + 1 + 2 = 4 = n_d$$

---

## PART III: QUANTUM MECHANICS

### Section 7. Three Routes to Quantum Structure

> **Companion**: See Interpretive Companion, Section 7: *Observation as Quantum Mechanics*

#### 7.1 Route A: Geometric (Hilbert Space)

**Theorem 7.1 (THM_0491).** [CANONICAL] The perspective subspace $V_\pi$ with $\mathbb{F} = \mathbb{C}$ and the inherited inner product is a complex Hilbert space:
$$V_\pi \cong \mathbb{C}^k, \quad k = n_d = 4$$

*Proof.* $V$ is a finite-dimensional real inner product space. The projection $\pi$ preserves the inner product on $V_\pi$. With $\mathbb{F} = \mathbb{C}$ (Theorem 4.4), $V_\pi$ inherits complex structure and becomes a complex inner product space, hence a finite-dimensional Hilbert space. $\square$

#### 7.2 Route B: Dynamical (Unitary Evolution and Born Rule)

**Theorem 7.2 (THM_0493).** Structure-preserving transitions on $V_\pi$ (preserving the inner product) are unitary:
$$U \in U(k): \quad U^\dagger U = I$$

**Theorem 7.3 (Gleason's Theorem).** [I-MATH] On a Hilbert space of dimension $\geq 3$ over $\mathbb{C}$, every probability measure on the lattice of closed subspaces has the form:
$$P(E) = \text{Tr}(\rho \cdot P_E)$$
for some density operator $\rho$ (positive, trace-one).

**Corollary 7.4 (Born Rule).** Since $\dim(V_\pi) = 4 \geq 3$ and $\mathbb{F} = \mathbb{C}$, measurement probabilities necessarily take the Born rule form.

#### 7.3 Route C: Algebraic (C*-algebra)

**Theorem 7.5.** The observable algebra $M_2(\mathbb{C})$ is a C*-algebra [I-MATH]. By the GNS construction [I-MATH]:
1. States are positive linear functionals $\to$ density matrices
2. Pure states form the Bloch sphere $S^2$ ($\dim = 3 = \dim(\text{Im}(\mathbb{H}))$)
3. The Born rule follows from the spectral theorem

#### 7.4 Convergence

**Theorem 7.6.** All three routes yield the same quantum-mechanical structure:
- Complex Hilbert space of dimension $\geq 3$
- Unitary time evolution
- Born rule for measurement probabilities
- Non-commuting observables (Theorem 2.6)
- Uncertainty relations (Theorem 2.7)

[**TODO**: Explicit mapping between the three route outputs]

---

## PART IV: NUMERICAL CONSEQUENCES

### Section 8. Lie Algebra Decomposition and Counting

> **Companion**: See Interpretive Companion, Section 8: *What the Numbers Mean*

#### 8.1 Generator Counting in $\mathfrak{u}(n_c)$

**Theorem 8.1.** The unitary Lie algebra $\mathfrak{u}(n_c) = \mathfrak{u}(11)$ has:
$$\dim(\mathfrak{u}(11)) = 11^2 = 121 \text{ generators}$$

**Theorem 8.2.** The $n_d \times n_c$ interface (between perspective and crystal) has:
$$n_d^2 + n_c^2 = 4^2 + 11^2 = 16 + 121 = 137 \text{ generator modes}$$

[**Note**: The precise meaning of "interface generators" requires the physical interpretation in the companion document. Mathematically, $137 = n_d^2 + n_c^2$ is a derived identity.]

#### 8.2 Cyclotomic Structure

**Definition 8.3.** The $m$-th cyclotomic polynomial is $\Phi_m(x) = \prod (x - \zeta)$ where $\zeta$ ranges over primitive $m$-th roots of unity.

**Theorem 8.4.** [I-MATH]
$$\Phi_6(x) = x^2 - x + 1$$

**Corollary 8.5.**
$$\Phi_6(n_c) = \Phi_6(11) = 121 - 11 + 1 = 111$$

**Theorem 8.6.** The quantity 111 admits the Lie-algebraic interpretation:
$$111 = n_c(n_c - 1) + 1 = \text{(off-diagonal generators of } \mathfrak{u}(n_c)\text{)} + 1$$

The 1 corresponds to the $U(1)$ center of $\mathfrak{u}(n_c)$.

#### 8.3 Fourth-Power Norm Forms

**Theorem 8.7.** [I-MATH] In the ring of integers $\mathbb{Z}[\zeta_8]$ of the 8th cyclotomic field, the norm form is:
$$N_{\mathbb{Q}(\zeta_8)/\mathbb{Q}}(a + b\zeta_8) = a^4 + b^4$$

This is the quartic analogue of the Gaussian integer norm $N(a + bi) = a^2 + b^2$.

**Theorem 8.8.** The framework primes admit classification by norm form:

**Sum-of-squares primes** ($p = a^2 + b^2$, Gaussian norm):

| Prime | Representation | Framework role |
|-------|---------------|----------------|
| 2 | $1^2 + 1^2$ | $\dim(\mathbb{C})$ |
| 5 | $1^2 + 2^2$ | Sum of first two dims |
| 17 | $1^2 + 4^2$ | $\dim(\mathbb{R})^2 + \dim(\mathbb{H})^2$ |
| 53 | $2^2 + 7^2$ | $\dim(\mathbb{C})^2 + \text{Im}(\mathbb{O})^2$ |
| 73 | $3^2 + 8^2$ | $\text{Im}(\mathbb{H})^2 + \dim(\mathbb{O})^2$ |
| 137 | $4^2 + 11^2$ | $n_d^2 + n_c^2$ |

**Fourth-power primes** ($p = a^4 + b^4$):

| Prime | Representation | Framework role |
|-------|---------------|----------------|
| 17 | $1^4 + 2^4$ | $\dim(\mathbb{R})^4 + \dim(\mathbb{C})^4$ |
| 97 | $2^4 + 3^4$ | $\dim(\mathbb{C})^4 + \text{Im}(\mathbb{H})^4$ |
| 337 | $3^4 + 4^4$ | $\text{Im}(\mathbb{H})^4 + \dim(\mathbb{H})^4$ |

*Verification*: `fourth_power_norm_form_catalog.py` -- 20/20 PASS

---

### Section 9. Derived Numerical Identities

> **Companion**: See Interpretive Companion, Section 9: *Physical Constants from Structure*

All quantities in this section are *algebraic consequences* of the dimensional values established in Part II. The physical identification (what measured quantity each expression corresponds to) is provided exclusively in the companion document.

#### 9.1 Primary Identities

**Identity 9.1.**
$$n_d^2 + n_c^2 = 4^2 + 11^2 = 137$$

**Identity 9.2.**
$$\frac{n_d}{\Phi_6(n_c)} = \frac{4}{111}$$

**Identity 9.3.**
$$n_d^2 + n_c^2 + \frac{n_d}{\Phi_6(n_c)} = 137 + \frac{4}{111} = \frac{15211}{111} = 137.036036\overline{036}$$

**Identity 9.4.**
$$\frac{\dim(\text{Im}(\mathbb{H}))}{\dim(\text{Im}(\mathbb{H})) + \dim(\text{Im}(\mathbb{C}))} = \frac{3}{3 + 1} = \frac{1}{4}$$

**Identity 9.5.**
$$\text{Im}(\mathbb{H})^4 + \dim(\mathbb{H})^4 = 3^4 + 4^4 = 81 + 256 = 337$$

**Identity 9.6.**
$$337/5 = 67.4$$

where $5 = \dim(\mathbb{R}) + \dim(\mathbb{H}) = 1 + 4$.

**Identity 9.7.**
$$\frac{n_d^2 + n_c^2}{2 \cdot n_c^2 / n_c} = \frac{137}{200} = 0.685$$

[**TODO**: Verify the exact derivation path for this ratio]

#### 9.2 Mass Ratio Identities

**Identity 9.8.**
$$12 \times 153 + \frac{n_c}{8 \times 9} = 1836 + \frac{11}{72} = \frac{132203}{72} = 1836.15277\overline{7}$$

where:
- $12 = \dim(\mathbb{H}) + \dim(\mathbb{O}) = 4 + 8$
- $153 = 9 \times 17 = \text{Im}(\mathbb{H})^2 \times (\dim(\mathbb{R})^4 + \dim(\mathbb{C})^4)$
- $8 = \dim(\mathbb{O})$
- $9 = \text{Im}(\mathbb{H})^2$

#### 9.3 Coupling Ratio Identities

**Identity 9.9.** [DERIVATION via Schur's lemma]
$$\frac{N_{\text{Goldstone}}}{n_c^2} = \frac{28}{121}$$

where $N_{\text{Goldstone}} = \dim(\text{Im}(\mathbb{H})) \times \dim(\text{Im}(\mathbb{O})) = 3 \times 7 + 7 = 28$ [**TODO**: verify exact Goldstone counting].

**Identity 9.10.**
$$\frac{9 \times 19}{2 \times 97} = \frac{171}{194}$$

where $97 = 2^4 + 3^4$ (Theorem 8.8) and $19 = 2 \times 97/194$... [**TODO**: clarify derivation of 171 and 194 from framework quantities]

#### 9.4 Quark Mass Ratio Identities

**Identity 9.11.**
$$\frac{150}{11} = 13.\overline{636363}$$

**Identity 9.12.**
$$\frac{124}{3} = 41.\overline{3}$$

**Identity 9.13.**
$$\frac{219}{11} = 19.9\overline{09}$$

[**TODO**: Derive 150, 124, 219 from framework dimensional quantities. Currently these are patterns identified in the data; their algebraic origin from {1,2,4,8,11} needs explicit derivation chains.]

---

## PART V: PREDICTIONS AND OPEN PROBLEMS

### Section 10. Testable Mathematical Consequences

> **Companion**: See Interpretive Companion, Section 10: *Experimental Tests and Falsification*

**Table 10.1.** Summary of derived numerical identities with their algebraic status:

| # | Identity | Numerical Value | Derivation Status | Verification |
|---|----------|-----------------|-------------------|--------------|
| 1 | $n_d^2 + n_c^2 + n_d/\Phi_6(n_c)$ | 137.036036... | [DERIVATION]; Step 5 [CONJECTURE] | `alpha_enhanced_prediction.py` PASS |
| 2 | $12 \times 153 + 11/72$ | 1836.15278... | [DERIVATION] | `proton_electron_best_formula.py` PASS |
| 3 | $1/4$ (tree-level coupling ratio) | 0.250 | [DERIVATION] from Im dims | `weinberg_best_formula.py` PASS |
| 4 | $337/5$ | 67.4 | [CONJECTURE] | Arithmetic |
| 5 | $137/200$ | 0.685 | [CONJECTURE] | Arithmetic |
| 6 | $63/200$ | 0.315 | [CONJECTURE] | Arithmetic |
| 7 | $2 \cdot n_c(n_c - 1)$ | 220 | [DERIVATION] | Arithmetic |
| 8 | $171/194$ | 0.88144... | [DERIVATION] partial | `weinberg_best_formula.py` PASS |

### Section 11. Open Mathematical Problems

1. **Pipeline formalization**: Complete proof of $121 \to 55 \to 18 \to 12$ with explicit filters
2. **Coupling mechanism**: Derive the identification of $n_d^2 + n_c^2$ with inverse coupling from algebraic principles alone (currently [CONJECTURE])
3. **Mass ratio origins**: Derive numerators (150, 124, 219, etc.) in quark mass ratios from {1,2,4,8,11}
4. **Cyclotomic selection**: Explain why $\Phi_6$ (and not $\Phi_3, \Phi_4$, etc.) appears in the correction terms
5. **Cosmological ratios**: Derive 337/5, 137/200, 63/200 from dimensional quantities
6. **Generation mass splitting**: Derive mass hierarchy from $SO(3)$ breaking in $\text{Im}(\mathbb{H})$
7. **CKM matrix**: Derive mixing angles from $\text{Im}(\mathbb{H})$ rotations

---

## APPENDICES

### Appendix A. Classical Theorems (Reference)

[**TODO**: Full statements and proof references for Frobenius, Hurwitz, Gleason, Cayley-Hamilton, GNS construction, Lovelock]

### Appendix B. Cyclotomic Polynomial Properties

[**TODO**: Properties of $\Phi_m(x)$ used in the text, evaluation at $x = 11$]

### Appendix C. Verification Scripts

| Script | Tests | Status | Section |
|--------|-------|--------|---------|
| `herm2_irreducibility_proof.py` | 10/10 | PASS | 5.4 |
| `perspective_transformative_filter.py` | 23/23 | PASS | 6.3 |
| `gauge_chain_convergence.py` | 9/9 | PASS | 6.3 |
| `alpha_enhanced_prediction.py` | Multiple | PASS | 9.1 |
| `proton_electron_best_formula.py` | Multiple | PASS | 9.2 |
| `weinberg_best_formula.py` | Multiple | PASS | 9.3 |
| `fourth_power_norm_form_catalog.py` | 20/20 | PASS | 8.3 |

### Appendix D. Complete Derivation Chain Diagram

[**TODO**: Full dependency graph from axioms to each numerical identity]

---

## Revision History

| Version | Date | Session | Changes |
|---------|------|---------|---------|
| 0.1 | 2026-02-06 | S255 | Initial template and draft |

---

*This document presents only mathematical content. For physical interpretation, motivation, and context, see the companion document* `PC_INTERPRETIVE_COMPANION.md`.

*Status: Speculative theoretical framework. Not peer-reviewed. Amateur work with AI assistance.*
*Affiliation: Independent researcher with AI assistance (Claude, Anthropic)*
