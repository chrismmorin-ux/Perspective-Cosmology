# Weinberg Angle sin²θ_W

REQUIRES: core/06_basis_geometry
PHYSICAL CLAIM: sin²θ_W = 3/8 at GUT scale, runs to ~0.23 at M_Z
STATUS: CONJECTURE (uses standard GUT physics)

---

## The Claim

```
sin²θ_W(M_Z) ≈ 0.231

Derived from:
- Geometric value 3/8 at unification scale
- Standard Model running to low energy
```

---

## Step 1: GUT Value

At unification scale, dimension counting gives:

```
sin²θ_W(M_GUT) = 3/8 = 0.375
```

### Geometric Origin

In B-structure:
```
B_gauge = B_color ⊕ B_weak

n_color = 3  (color dimensions)
n_weak = 2   (weak isospin dimensions)
```

The Weinberg angle at unification:
```
sin²θ_W = n_weak / (n_color + n_weak) = 2/5 × constant

With proper normalization:
sin²θ_W = 3/8
```

This is the standard SU(5) / SO(10) GUT prediction.

---

## Step 2: Running to Low Energy

The coupling constants run with energy scale:

```
sin²θ_W(μ) = sin²θ_W(M_GUT) + Δ(μ)
```

### Beta Functions

One-loop running:
```
d(sin²θ_W)/d(ln μ) = (g'² + g²)/16π² × f(particle content)
```

### Running Magnitude

From M_GUT ~ 10¹⁶ GeV to M_Z ~ 91 GeV:
```
ln(M_GUT/M_Z) ≈ 33

Δ(M_Z) ≈ -0.14 to -0.17
```

### Result

```
sin²θ_W(M_Z) = 3/8 - Δ
             ≈ 0.375 - 0.145
             ≈ 0.23

Measured: 0.23122 ± 0.00004
```

---

## B-Geometry Interpretation

In perspective framework:

```
sin²θ_W = "visible weak fraction" of electroweak structure

At GUT scale: All gauge dimensions equally accessible
              → sin²θ_W = geometric ratio = 3/8

At low energy: Symmetry breaking hides some structure
               → sin²θ_W runs to ~0.23
```

---

## Assumptions

1. **n_color = 3, n_weak = 2**
   - Standard Model values
   - Why these? See gauge_structure.md

2. **GUT unification occurs**
   - sin²θ_W = 3/8 requires grand unification
   - Borrowed from mainstream physics

3. **Standard Model particle content**
   - Running depends on what particles exist
   - 3 generations assumed

4. **SUSY or not**
   - Non-SUSY: sin²θ_W(M_Z) ≈ 0.21
   - SUSY: sin²θ_W(M_Z) ≈ 0.23 (better fit)
   - Threshold corrections matter

---

## Numerology Risk: LOW-MEDIUM

| Factor | Assessment |
|--------|------------|
| 3/8 is standard GUT | Not new to this framework |
| Running is mainstream | Borrowed, not derived |
| Good agreement | But that's expected from SM |

---

## Honest Assessment

This is NOT a novel prediction of perspective cosmology.

We borrow:
- sin²θ_W = 3/8 from GUT theories (1970s)
- Running from Standard Model renormalization

The framework claims to explain WHY 3/8:
- Dimension counting in B
- Geometric ratio of gauge subspaces

But 3/8 was known before this framework existed.

---

## Falsification

Would be wrong if:
- B-structure requires different n_color, n_weak
- sin²θ_W ≠ 3/8 at unification (proton decay constraints?)
- Running gives wrong low-energy value

---

## Status: CONJECTURE

- Uses established physics (GUT + SM running)
- Framework interpretation is post-hoc
- Not a genuine prediction
