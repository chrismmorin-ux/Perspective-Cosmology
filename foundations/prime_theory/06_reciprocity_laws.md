# Reciprocity Laws

## Quadratic Reciprocity

### The Law (Gauss, 1801)

For distinct odd primes p and q:

```
(p/q)(q/p) = (-1)^((p-1)/2 · (q-1)/2)
```

where (a/p) is the Legendre symbol:
- (a/p) = 1 if a is a quadratic residue mod p
- (a/p) = -1 if a is a quadratic non-residue mod p

### Explicit Form

| p mod 4 | q mod 4 | (p/q) vs (q/p) |
|---------|---------|----------------|
| 1 | 1 | Same |
| 1 | 3 | Same |
| 3 | 1 | Same |
| 3 | 3 | Opposite |

### Supplementary Laws

```
(-1/p) = (-1)^((p-1)/2) = { 1 if p ≡ 1 (mod 4)
                          { -1 if p ≡ 3 (mod 4)

(2/p) = (-1)^((p²-1)/8) = { 1 if p ≡ ±1 (mod 8)
                          { -1 if p ≡ ±3 (mod 8)
```

### Proofs

Gauss gave 8 proofs. There are now over 240 known proofs, including:
- Eisenstein's proof using roots of unity
- Zolotarev's proof using permutations
- One-sentence proof by Zagier

---

## Connection to Gaussian Integers

### Prime Splitting

For odd prime p:
- p ≡ 1 (mod 4) ⟺ p splits in Z[i] ⟺ p = a² + b²
- p ≡ 3 (mod 4) ⟺ p is inert in Z[i] ⟺ p ≠ a² + b²

### Quadratic Character and Splitting

(−1/p) = 1 ⟺ p splits in Q(i) ⟺ p ≡ 1 (mod 4)

This is the prototype for all reciprocity laws: **residue symbols encode splitting behavior**.

---

## Cubic Reciprocity

### Setting: Eisenstein Integers Z[ω]

Let ω = e^(2πi/3). The cubic residue symbol (a/π)_3 for Eisenstein prime π determines whether a is a cube mod π.

### The Law

For primary Eisenstein primes π, θ (primary means ≡ 2 mod 3):

```
(π/θ)_3 = (θ/π)_3
```

No sign! Cubic reciprocity is simpler than quadratic in this respect.

### Prime Splitting in Q(ω)

- p = 3: ramifies (3 = -ω²(1-ω)²)
- p ≡ 1 (mod 3): splits (p = ππ̄)
- p ≡ 2 (mod 3): inert

---

## Quartic Reciprocity

### Setting: Gaussian Integers Z[i]

The quartic residue symbol (a/π)_4 takes values in {1, -1, i, -i}.

### The Law

For primary Gaussian primes π, θ (primary means ≡ 1 mod (1+i)³):

```
(π/θ)_4 = (θ/π)_4 · (-1)^((N(π)-1)/4 · (N(θ)-1)/4)
```

### Connection to Fourth Powers

This is directly relevant to understanding when fourth powers occur!

A number a is a fourth power mod p (for p ≡ 1 mod 4) iff:
- a is a square mod p (quadratic condition)
- (a/π)_4 = 1 where p = ππ̄ in Z[i]

---

## Higher Reciprocity Laws

### Eisenstein Reciprocity

For prime l and l-th power residue symbol (a/p)_l:

If p is a prime ≡ 1 (mod l) and a is coprime to p:
```
(a/p)_l depends on how (a) factors in Q(ζ_l)
```

### Artin Reciprocity (Class Field Theory)

The ultimate generalization: for any abelian extension L/K, there's a canonical isomorphism

```
Gal(L/K) ≅ (some quotient of the idele class group of K)
```

This implies all classical reciprocity laws as special cases.

---

## Reciprocity and Division Algebras

### The Pattern

| Residue | Ring | Related to |
|---------|------|------------|
| Quadratic | Z[i] | dim(C) = 2 |
| Cubic | Z[ω] | (ω is cube root) |
| Quartic | Z[ζ_4] = Z[i] | dim(H) = 4 |
| Eighth-power | Z[ζ_8] | 8 = dim(O) |

### Quartic Residues and Quaternions

The quartic residue symbol lives in Z[i], the Gaussian integers.

The Gaussian integers relate to the complex numbers C.

But the full quartic story requires Z[ζ_8] = Z[i, √2], which has degree 4 over Z - the quaternion dimension!

### Why No Good Octonionic Reciprocity?

Octonions are non-associative, which breaks:
- Galois theory (requires group structure)
- Class field theory (relies on commutativity of Galois groups)

There's no natural "octonionic reciprocity law" because the algebraic structures don't exist.

---

## Chebotarev Density Theorem

### Statement

For a Galois extension L/K with Galois group G:

The primes of K splitting with Frobenius in conjugacy class C have density |C|/|G|.

### For Cyclotomic Fields Q(ζ_n)/Q

Gal(Q(ζ_n)/Q) ≅ (Z/nZ)^×

The primes splitting completely (Frobenius = identity) have density 1/φ(n).

### For Q(ζ_8)/Q

| Conjugacy class | Primes | Density |
|-----------------|--------|---------|
| {1} (splits completely) | p ≡ 1 (mod 8) | 1/4 |
| {3} | p ≡ 3 (mod 8) | 1/4 |
| {5} | p ≡ 5 (mod 8) | 1/4 |
| {7} | p ≡ 7 (mod 8) | 1/4 |

Primes ≡ 1 (mod 8) are exactly those for which fourth-power arithmetic is "simplest."

---

## The Langlands Program

### Vision

Unify all reciprocity laws into a single framework connecting:
- Galois representations
- Automorphic forms
- L-functions

### Relevance

This is the modern continuation of reciprocity theory. The quartic and higher reciprocity laws are now understood as shadows of deeper structures.

The division algebra dimensions {1, 2, 4, 8} appear in Langlands theory through:
- Local fields (dimensions 1, 2, 4)
- Global fields
- Motives

---

## Key Takeaways

1. **Reciprocity laws encode prime splitting**: The Legendre symbol tells you how primes split in quadratic fields.

2. **Higher reciprocity requires larger rings**: Cubic needs Eisenstein integers, quartic needs Gaussian integers (or Z[ζ_8]).

3. **Fourth power is natural**: Quartic reciprocity involves Z[i] and Z[ζ_8], connecting to dim(H) = 4.

4. **Octonions break the pattern**: Non-associativity prevents natural eighth-power reciprocity.

5. **Modern synthesis**: Class field theory and Langlands unify all these patterns.
