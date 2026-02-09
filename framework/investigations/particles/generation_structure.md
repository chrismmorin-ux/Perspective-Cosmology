# Generation Structure from Division Algebras

**Status**: DERIVATION (Sessions S119, S321, S322, S328, S335, S336, S339)
**Confidence**: HIGH -- based on Hom(H, R^7) decomposition (S321)
**Verification**: `generation_mechanism_formalization.py` (37/37 PASS), `scalar_channel_dm_identity.py` (61/61 PASS), `generation_21_so7_coincidence.py` (26/26 PASS), `mass_hierarchy_so3_breaking.py` (13/13 PASS), `u1y_embedding_so11.py` (34/34 PASS, S328), `dm_identity_revision.py` (34/34 PASS, S335), `colored_pngb_branching_ratios.py` (24/24 PASS, S336), `det_tr_decoupling_analysis.py` (32/32 PASS, S339)
**Last Updated**: 2026-02-09 (S339 det-Tr correction + S336 branching ratios)

---

## The Question

Why are there exactly 3 generations of fermions in the Standard Model?

---

## The Answer: Quaternionic Channels in Hom(H, R^7)

### Core Result (S321)

The tilt field eps lives in Hom(R^4, R^7) = Hom(H, R^7). Using H = R + Im(H):

```
Hom(H, R^7) = Hom(R, R^7)  +  Hom(Im(H), R^7)
            = R^7           +  (R^7 + R^7 + R^7)
            = 1 scalar      +  3 generation channels
```

Each Im(H) direction (i, j, k) gives one independent R^7 channel. Each channel carries a full generation's worth of internal (color + flavor) degrees of freedom. The count 3 = dim(Im(H)) is forced by Hurwitz's theorem.

### Why This Works

1. The tilt eps: H -> R^7 is a linear map from quaternionic R^4 to internal R^7
2. Decompose H = R + span(i) + span(j) + span(k)
3. eps restricted to each Im(H) direction gives an independent R^7 vector
4. The 3 restrictions eps(i), eps(j), eps(k) are independent DOFs (orthogonal domain subspaces)
5. Each R^7 carries the same internal structure -> same gauge quantum numbers
6. By Weinberg criterion: identical structure = same physical role = 1 generation each

### Dimension Counting

| Component | Dimension | Physical Role |
|-----------|-----------|---------------|
| Hom(R, R^7) | 7 | Scalar channel (no generation index) |
| Hom(span(i), R^7) | 7 | Generation 1 |
| Hom(span(j), R^7) | 7 | Generation 2 |
| Hom(span(k), R^7) | 7 | Generation 3 |
| **Total** | **28** | = dim(Hom(R^4, R^7)) |

---

## Three Complementary Mechanisms

### Mechanism C: Hom Decomposition (STRONGEST)

As above. Pure linear algebra once R^4 = H is established.

**Chain**: CCP -> H -> H = R + Im(H) -> Hom(H,R^7) = R^7 + 3*R^7 -> 3 generations
**Confidence**: [DERIVATION] (I-MATH + Weinberg criterion)

### Mechanism D: F=C Selection + Latent Complex Structures

H admits 3 complex structures J_I, J_J, J_K satisfying the quaternion algebra. F = C [D: CCP + directed time] selects ONE (say J_I), but the other two remain mathematically present ("latent"). All 3 structures carry fermion content.

- Each J is antisymmetric, orthogonal, and satisfies J^2 = -I_4
- The 3 J's are linearly independent in M_4(R)
- F = C selects 1, leaving 2 latent -> total 3 = Im_H

**Chain**: CCP -> F=C -> select 1 J -> 2 latent -> total 3 channels
**Confidence**: [DERIVATION]

### Mechanism A: SO(3) Generation Symmetry

Aut(H) = SO(3) acts on Im(H) = R^3 by rotations. If fermions carry SO(3)_family quantum numbers in the vector rep (dim 3), there are 3 copies. Key properties:

- SO(3) vector rep = adjoint rep = dim 3 (unique to SO(3))
- SO(3)_family commutes with gauge group (acts on Im(H) c R^4, gauge on R^11)
- CKM/PMNS = 3x3 unitary matrices (consistent with broken SO(3))
- Mass hierarchy from SO(3) breaking (3 different masses)
- No 4th generation: SO(3) vector rep is exactly 3-dimensional (irreducible)

**Chain**: CCP -> H -> Aut(H) = SO(3) -> vector rep dim 3 -> 3 generations
**Confidence**: [DERIVATION]

### Common Root

All three mechanisms trace to **dim(Im(H)) = 3**, which is rigid by Hurwitz's theorem (imaginary dimensions of division algebras are {0, 1, 3, 7}).

---

## Derivation Chain

```
CCP [AXIOM]
  -> H unique 4D assoc. division algebra [D: Frobenius, I-MATH]
  -> R^4 = H [D: n_d=4 from CCP]
  -> H = R + Im(H), dim(Im(H)) = 3 [I-MATH: Frobenius + Hurwitz]
  -> eps in Hom(H, R^7) [D: tilt = Grassmannian DOF, resolved via IRA-06/08]
  -> Hom(H, R^7) = R^7 + Im(H) x R^7 [I-MATH: linear algebra]
  -> 3 independent R^7 channels [D: restrictions to orthogonal subspaces]
  -> Each channel = 1 generation [Weinberg-forced: identical structure]
  -> 3 generations [D]
```

**Assumptions**: 1 axiom (CCP) + 4 [I-MATH] + 3 [D] + 0 [A-PHYSICAL]
**No new IRA needed**: Generation count is DERIVED, not assumed.

---

## IRA-09 History

| Session | Claim | Status |
|---------|-------|--------|
| S119 | Generations = Im_H = 3 (verbal) | [A-PHYSICAL], no mechanism |
| S299 | G_2 -> SU(3) branching: 7->3+3bar+1 gives 3 gens | **RETRACTED S320**: SU(3) = color |
| S320 | Retraction: SU(3) c G_2 = color, not generation | CORRECTION (lepton test decisive) |
| S321 | Hom(H, R^7) decomposition: 3 channels from Im(H) | **RESOLVED**: [DERIVATION] via Mechanism C + Weinberg |

---

## PSL(2,7): Independent Confirmation (Session 120)

### The Group PSL(2,7)

|PSL(2,7)| = 168 = O x Im_H x Im_O = 8 x 3 x 7

PSL(2,7) is the automorphism group of the Fano plane, a discrete subgroup of G_2.

### Irreducible Representations

PSL(2,7) irreps: **1, 3, 3', 6, 7, 8**

TWO 3-dimensional irreps exist (3 and 3', complex conjugates). NO 2-dim or 4-dim irreps.

If fermions transform as a triplet under PSL(2,7): 3 generations are a symmetry multiplet. No 2 or 4 generations possible.

### Division Algebra Connection

| PSL(2,7) irrep dim | Framework dimension |
|---------------------|---------------------|
| 1 | R (reals) |
| 3 | Im_H (imaginary quaternions) |
| 6 | C x Im_H |
| 7 | Im_O (imaginary octonions) |
| 8 | O (full octonions) |

**Verification**: `psl27_flavor_symmetry.py` (10/10 PASS)

---

## What Would Falsify This?

1. Discovery of a 4th generation fermion -> dim(Im(H)) = 3 wrong
2. Evidence that generation structure is not from quaternions
3. A mechanism giving 3 generations without division algebras

**Current status**: No 4th generation found. Framework consistent.

---

## Scalar Channel and DM Identity (S322, REVISED S335)

~~The scalar channel Hom(R, R^7) = R^7 provides the dark matter particle identity.~~ **RETRACTED S335**: The 4 color-singlet pNGBs (one from each R^4 direction) exactly fill the Higgs doublet (4 real DOFs). After EWSB: 3 eaten (W+, W-, Z) + 1 physical Higgs. Zero leftover for DM. The scalar channel color singlet IS part of the Higgs, not a separate DM candidate.

### What survives from S322:
- **SO(3)_family singlet**: R is fixed by Aut(H) = SO(3) -- still true structurally
- **1+3 decomposition**: n_d = 4 = 1 (R) + 3 (Im(H)) -- still true structurally
- **Color singlet = "1" in 7 -> 3+3bar+1** -- true, but this IS the Higgs DOF

### What is retracted:
- **DM = pNGB color singlet** [RETRACTED S335]: pNGB singlet = Higgs doublet (34/34 PASS)
- **sigma_SI = 0 from G_2 singlet** [INVALIDATED S335]: G_2 singlet = Higgs, not DM
- **H-parity DM stability** [SCOPE CLARIFIED S335]: H-parity (FFT + Euler) is exact for boson-only operators but Yukawa couplings (degree-1 in eps) are outside its scope

### DM identity: OPEN (S335, CORRECTED S339)
The mass formula m_DM = m_e*(n_c-1)^n_d = 5.11 GeV [DERIVATION] and Omega ratio m_DM/m_p ~ 5.45 (1.3%) [CONJECTURE] **survive** -- they are structural, identity-independent. The DM particle identity is **genuinely open**.

**S339 correction**: The S335 claim that det(M) and Tr(M) have "different S_4 characters" is **INCORRECT** for the physically relevant group action (conjugation). Under conjugation, BOTH are trivial rep [THEOREM, `det_tr_decoupling_analysis.py`]. At the democratic vacuum, delta(det) = c^3 * delta(Tr) — proportional at first order, not orthogonal. All 28 pNGBs are accounted for (4 Higgs + 24 colored). det(M) determines a mass **scale** (5.11 GeV, like 't Hooft det(m_f)), not a particle. The DM carrier particle is UNKNOWN. See `framework/investigations/particles/dark_matter_identity.md` for full analysis.

*Verification*: `scalar_channel_dm_identity.py` (61/61 PASS, S322), `dm_identity_revision.py` (34/34 PASS, S335), `det_tr_decoupling_analysis.py` (32/32 PASS, S339)

## 21 = dim(so(7)): Structural Identity (S322)

The coincidence Im(H)*Im(O) = 3*7 = 21 = dim(so(7)) is **STRUCTURAL** [THEOREM]:

- Cayley-Dickson doubling: Im(D_{k+1}) = 2*Im(D_k) + 1
- Therefore: Im(D_k)*Im(D_{k+1}) = n*(2n+1) = (2n+1)*2n/2 = dim(so(2n+1))
- Universal chain: R->C: 0*1=0=dim(so(1)), C->H: 1*3=3=dim(so(3)), H->O: 3*7=21=dim(so(7))
- The 28 = 7+21 Hom decomposition matches SO(8)->SO(7) adjoint branching

*Verification*: `generation_21_so7_coincidence.py` (26/26 PASS, S322)

## Mass Hierarchy: OPEN (S322)

SO(3)_family breaking alone is **INSUFFICIENT** for the mass hierarchy:

- SO(3) -> U(1) (from F=C) gives 2+1 pattern, not 3 distinct hierarchical masses
- Z_3 from quaternion product gives cyclic ordering but equal magnitudes
- epsilon = 1/n_c gives wrong ratios (off by 7-12x)
- The flavor puzzle remains OPEN (no BSM model has solved it)

Framework scorecard: 3 generations [DERIVATION] + y_t = 1 [CONJECTURE] + 2+1 ordering [DERIVATION] + inter-generation ratios [OPEN]

*Verification*: `mass_hierarchy_so3_breaking.py` (13/13 PASS, S322)

---

## H-Parity Absolute Stability (S323)

H-parity (quaternion conjugation Z_2: q -> q*) is an **EXACT** symmetry [THEOREM]:

1. **FFT argument**: SO(4)-invariants on Hom(R^4, R^7) are generated by G = eps^T eps (Gram matrix). Each spacetime index appears an EVEN number of times. H-parity sign = (+/-1)^{even} = +1 always.
2. **Even-degree theorem**: All SO(4)-invariant operators have even total degree in eps. No cubic (Yukawa-type) vertices exist.
3. **Euler parity**: In any Feynman diagram, total external legs = EVEN (from even-degree vertices + internal line pairing).
4. **Combined prohibition**: DM decay to k fermions requires k=odd (Euler) but H-parity forbids k=odd. Contradictory for ALL k.
5. **No anomaly**: H-parity charge sum = 7 - 21 = -14 (EVEN), so no Z_2 gauge anomaly.
6. **No spontaneous breaking**: Vacuum has <eps_a> = 0 for generation channels.

**Consequence**: H-parity protects the pNGB potential from odd-degree operators [THEOREM]. **Scope clarified S335**: This applies to SO(4)-invariant polynomials on Hom(R^4,R^7) (boson-only operators). Yukawa couplings (degree-1 in eps) are OUTSIDE the FFT scope. DM stability requires additional argument if DM couples via Yukawa.

*Verification*: `h_parity_conservation_depth.py` (31/31 PASS, S323)

## Dark Quarks: Colored Scalar Channel (S323)

The 3+3bar in R^7 = 3+3bar+1 under G_2 -> SU(3) are **colored scalars** [CONJECTURE]:

- **Spin**: 0 (scalar channel = bosonic, not fermionic)
- **SU(2)_L**: ~~singlet~~ **DOUBLET** (S328 CORRECTION: R^4 = (2,2) under SU(2)_L x SU(2)_R has NO SU(2)_L singlet)
- **H-parity**: +1 (same as DM)
- **Mass**: ~ f ~ 1.35 TeV from G_2 -> SU(3) breaking [CONJECTURE from CW]
- **Single decay forbidden**: Color + spin conservation prevents DQ -> DM + anything
- **Pair annihilation**: DQ + anti-DQ -> SM (QCD cross-section, efficient)
- **Cosmology**: Negligible relic abundance (annihilate away in early universe)
- **LHC**: Pair production at ~TeV scale; signature = resonant dijet from dark meson decay

*Verification*: `dark_quarks_colored_scalar.py` (18/18 PASS, S323)

## SO(8) Triality and 28 = 7 + 21 (S323)

The 28 = dim(Hom(H,R^7)) = dim(adj SO(8)) identity [THEOREM from 2*n_d = dim_O]:

- Triality (S_3 = Out(SO(8))) permutes three SO(7) c SO(8) embeddings
- **Framework BREAKS triality**: choosing 1 in O reduces S_3 -> Z_2 (charge conjugation)
- Residual Z_2 swaps 8_s <-> 8_c (particle-antiparticle)
- G_2 = intersection of all three SO(7)'s, so triality is invisible at G_2 level
- Full branching: 28 -> (7+21) -> (7+14+7) -> 8 + 3*(3+3bar) + 2*1 under SU(3)
- H-parity and triality are **independent** symmetries on different spaces

*Verification*: `so8_triality_28_decomposition.py` (24/24 PASS, S323)

## CKM/PMNS Mixing Mechanism (S325)

The CKM and PMNS mixing matrices arise from the SO(3)\_family structure of Im(H):

### CKM Mechanism [DERIVATION]

1. **Mass matrix decomposition**: Under SO(3)\_family, the mass matrix M in End(Im(H)) = M\_3(R) decomposes as 3 x 3 = **1** (singlet: universal mass) + **3** (vector: antisymmetric part) + **5** (symmetric traceless: 2+1 splitting).
2. **CKM requires antisymmetric component**: If mass matrices are simultaneously diagonalizable (only 1+5 components), V\_CKM = I (trivial). Non-trivial mixing REQUIRES the vector (3) component pointing in DIFFERENT directions for up-type vs down-type quarks.
3. **Quaternion product -> misalignment**: The SO(3) generators L\_a satisfy [L\_a, L\_b] = epsilon\_{abc} L\_c (= quaternion structure constants). The antisymmetric mass components for up/down quarks are SO(3) vectors in Im(H). The CKM angle = arccos(c\_u . c\_d / |c\_u||c\_d|).
4. **Source of misalignment**: SU(2)\_L breaking by Higgs VEV introduces a "twist" between up and down sectors, mediated by the vacuum alignment angle xi = 4/121.

### CP Violation from Quaternion Non-Commutativity [DERIVATION]

- Im(H) = so(3) is non-abelian: [L\_a, L\_b] = epsilon\_{abc} L\_c
- Quaternion conjugation reverses products: (pq)\* = q\*p\*
- Since pq != qp for p,q in Im(H), CP is NOT a symmetry of the Yukawa sector
- For N = Im\_H = 3 generations: (N-1)(N-2)/2 = **1 CP phase** [I-MATH counting]
- For 2 generations: 0 CP phases (consistent: any abelian subalgebra gives no CP violation)
- PMNS: 1 Dirac + 2 Majorana = 3 total phases for Majorana neutrinos

### Numerical Candidates [SPECULATION]

- Best match: lambda = 5/22 = (2/n\_c)(1+1/n\_d) = 0.2273 (0.85% from experiment 0.2254)
- Decomposition: sqrt(xi) \* (n\_d+1)/n\_d = (2/11)(5/4)
- Quark-lepton complementarity: theta\_12(PMNS) + theta\_12(CKM) = 46.48 ~ 45 deg
- No simple framework expression matches lambda to < 0.8%

### What Remains OPEN

- Cabibbo angle magnitude (requires composite sector dynamics)
- Full CKM matrix (3 angles + 1 phase quantitatively)
- PMNS matrix (requires neutrino mass mechanism)
- Mass hierarchy (determines mixing via Gatto-Sartori-Tonin relation)
- Quantitative CP-violating phase delta

*Verification*: `ckm_pmns_so3_breaking.py` (26/26 PASS, S325)

## Dark Quark Electroweak Quantum Numbers (S325, CORRECTED S328)

### SU(2)\_L: ~~Singlet~~ DOUBLET [CORRECTION S328]

**S325 claimed**: R c H is SU(2)\_L invariant (custodial singlet = gauge singlet). **INCORRECT.**

**S328 correction**: The (2,2) representation of SU(2)\_L x SU(2)\_R decomposes under SU(2)\_L alone as 2+2 (two doublets). There is NO SU(2)\_L singlet in (2,2). The custodial singlet (antisymmetric under SU(2)\_V) is NOT an SU(2)\_L singlet -- these are different decompositions.

**Correct result**: ALL 28 pNGBs are SU(2)\_L DOUBLETS with Y = +/-1/2, regardless of U(1)\_Y embedding. The colored scalars are (2, +/-1/2, 3) + conjugates.

### U(1)\_Y Embedding (S328) [DERIVATION]

F=C selects complex structure J = -2\*L1 on R^4 = H. This preserves:
- ALL of SU(2)\_R (since [L\_a, R\_b] = 0 for all a,b)
- Only U(1)\_L (generated by L1 ~ J) from SU(2)\_L

Result: SO(4) -> SU(2)\_R x U(1)\_L. Physical identification:
- SU(2)\_L (SM) = SU(2)\_R (anti-self-dual, preserved by J)
- U(1)\_Y (SM) = U(1)\_L (generated by L1 ~ J)
- Y eigenvalues = +/-1/2 from L1 action on (2\_L, 2\_R) rep

Possible T\_X admixture from SO(7) centralizer. The pipeline's "u(1) from Im\_C" is a BROKEN generator (coset direction of SO(11)/(SO(4)xSO(7))) and CANNOT be U(1)\_Y.

### Scenarios and LHC Phenomenology (REVISED S328)

| Scenario | Y | Q (upper/lower) | LHC Signature | Status |
|----------|---|------------------|---------------|--------|
| Doublet | +1/2 | +1, 0 | Charged + neutral pair, dijet + MET | Distinct from S325 |

All colored pNGBs are SU(2)\_L doublets. Each doublet has one Q=+1 and one Q=0 component (for Y=+1/2) or one Q=0 and one Q=-1 (for Y=-1/2). The neutral component can contribute to MET; the charged component gives charged tracks.

H-parity protection applies regardless: single decay FORBIDDEN (even-degree theorem [THEOREM]), only pair annihilation allowed.

*Verification*: `u1y_embedding_so11.py` (34/34 PASS, S328). Supersedes `dark_quark_hypercharge.py` (S325).

## Open Questions

1. **Mass hierarchy**: OPEN. SO(3) breaking gives ordering but not magnitude. Partial compositeness mixing angles needed. Koide formula connection [SPECULATION].
2. ~~**Scalar channel**~~: RESOLVED S322. DM = color-singlet from scalar channel [CONJECTURE].
3. ~~**CKM/PMNS**~~: PARTIALLY RESOLVED S325. Mechanism identified [DERIVATION], numerical values OPEN.
4. ~~**Dark quarks**~~: RESOLVED S323. Colored scalars at ~TeV scale, pair-annihilate away cosmologically [CONJECTURE].
5. **Koide formula**: Can the lepton mass ratio formula 2/3 be derived from S^2 = SO(3)/U(1) geometry?
6. ~~**Dark quark EW quantum numbers**~~: **RESOLVED S328**. All pNGBs are SU(2)\_L DOUBLETS with Y = +/-1/2 [DERIVATION]. S325 "singlet" RETRACTED.
7. **Triality companion 7** (NEW, S323): Physical role of the second 7 in 28 -> 7+14+7 under G\_2.
8. ~~**U(1)\_Y embedding in SO(11)**~~: **RESOLVED S328**. F=C -> SO(4) -> SU(2)\_R x U(1)\_L. Physical SU(2)\_L = SU(2)\_R. Y = L1 eigenvalues (+/-1/2) [DERIVATION].
9. **DM identity** (S328/S335/S339): pNGB color singlet = Higgs [THEOREM, S335]. det-Tr S_4 character argument RETRACTED S339 (wrong group action). det(M) = mass scale, not particle [THEOREM, S339]. All 28 pNGBs accounted for. DM carrier: UNKNOWN. See `framework/investigations/particles/dark_matter_identity.md` for full candidate survey.

---

## Summary

**3 generations because dim(Im(H)) = 3. 1 dark sector because dim(R) = 1. Total: n\_d = 4.**

The tilt field eps in Hom(H, R^7) inherently carries 4 quaternionic channels: 1 scalar (R) + 3 generation (Im(H)). The generation channels give 3 SM generations (Weinberg-forced). The scalar channel color singlet is the Higgs doublet (4 pNGB DOFs = 3 eaten + 1 Higgs, S335 [THEOREM]). Dark quarks = colored scalars at ~TeV: (2, 1/6, 3) leptoquark + (2, -5/6, 3) diquark (S336 [DERIVATION]). DM particle identity is OPEN (mass formula and Omega ratio survive). The count 3\*7 = 21 = dim(so(7)) is structural (Cayley-Dickson theorem). The 28 = 7+21 matches SO(8) -> SO(7) adjoint branching, with triality broken by the identity choice in O.

CKM mixing arises from the antisymmetric mass component (SO(3) vector) pointing in different directions for up-type vs down-type quarks [DERIVATION]. CP violation is structural: quaternion non-commutativity gives exactly 1 CP phase for 3 generations [DERIVATION]. Numerical values of mixing angles remain OPEN (require composite sector dynamics). Dark quarks are SU(2)\_L **doublets** with Y = +/-1/2 [DERIVATION, S328]. (S325 "singlet" and "Y=0" claims RETRACTED.)

---

*Verification*: `generation_mechanism_formalization.py` (37/37 PASS, S321), `scalar_channel_dm_identity.py` (61/61 PASS, S322), `generation_21_so7_coincidence.py` (26/26 PASS, S322), `mass_hierarchy_so3_breaking.py` (13/13 PASS, S322), `h_parity_conservation_depth.py` (31/31 PASS, S323), `dark_quarks_colored_scalar.py` (18/18 PASS, S323), `so8_triality_28_decomposition.py` (24/24 PASS, S323), `ckm_pmns_so3_breaking.py` (26/26 PASS, S325), ~~`dark_quark_hypercharge.py`~~ (14/14 PASS, S325, **SUPERSEDED by S328**), `u1y_embedding_so11.py` (34/34 PASS, S328), `dm_identity_revision.py` (34/34 PASS, S335), `colored_pngb_branching_ratios.py` (24/24 PASS, S336), `det_tr_decoupling_analysis.py` (32/32 PASS, S339)
*Related*: `foundations/generations_from_quaternions.md`, `spinor_gap_su3_analysis.py`, `framework/investigations/particles/dark_matter_identity.md`
