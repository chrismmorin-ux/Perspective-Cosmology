# Variant 2 Grading Rubric

**Do NOT read this section until the model has finished responding.**

---

## Known Ambiguities the Model Should Find

### 1. n_d = dim(D) vs dim(Im(D))

The "accessible dimension" could mean the full algebra dimension (4 for H) or just the imaginary part (3 for H).

The full dimension is more consistent because:
- (a) partition identity n_d + n_c = 15 works
- (b) n_d^2 + n_c^2 = 137 is prime

### 2. n_c scope -- Hurwitz vs Frobenius

"Permitted" algebras could mean all normed division algebras (Hurwitz: R,C,H,O -> n_c=11) or only associative ones (Frobenius: R,C,H -> n_c=4).

Hurwitz is more consistent because:
- (a) O satisfies no-zero-divisors even though it fails associativity
- (b) n_c=4 breaks all denominator polynomials and gauge group embeddings

---

## Bonus Ambiguities We'd Be Interested to See Identified

### 3. Is associativity required?

T0 says transitions compose and have inverses -- this doesn't explicitly require associativity. The argument for associativity (time evolution consistency) is physical/intuitive, not strictly axiomatic. This is an honest gap (see G-004 in THM_0484).

### 4. Why the maximum algebra?

The axioms ask for the "maximum" n_d, but don't explicitly require maximality. Why not n_d = 2 (from C) or n_d = 1 (from R)?

### 5. Why sum imaginary dimensions?

The operation of summing Im(D) across all division algebras is not obviously mandated by the axioms. Why not sum total dimensions? Why not take the maximum?

---

## Outcome Classification

### HIGH VALUE

A model that finds ambiguities 1-2, plus identifies #3 (associativity gap) or #5 (why sum?) as genuine weaknesses. These are real open problems in the framework.

### EXPECTED VALUE

Identifies both known ambiguities (1 and 2), argues both sides correctly, and correctly assesses which interpretation is more consistent.

### PARTIAL VALUE

Identifies one of the two known ambiguities, or identifies both but misjudges which interpretation is more consistent.

### LOW VALUE

Identifies no genuine ambiguities, or only superficial ones (e.g., "the field F could be R or C" without exploring consequences).

---

*Extracted from Runbook Section G grading notes, Session 135.*
