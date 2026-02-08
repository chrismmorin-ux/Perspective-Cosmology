# Variant 1 Grading Rubric

**Do NOT read this section until the model has finished responding.**

---

## Expected Answers

| Quantity | Expected Value | Key Derivation Step |
|----------|---------------|---------------------|
| n_d | 4 | Frobenius: R(1), C(2), H(4), O(8). Associativity excludes O. Max = 4. |
| n_c | 11 | Im(R)=0, Im_C=1, Im_H=3, Im_O=7. Total: 0+1+3+7 = 11. |
| n_d^2 + n_c^2 | 137 | 16 + 121 = 137 |

---

## Classification Guide

### FULL SUCCESS

Model gets all three:
- n_d = 4 (from Frobenius + associativity)
- n_c = 11 (from imaginary dimension sum)
- Computes 4^2 + 11^2 = 137
- Reasoning chain is mathematically sound

### PARTIAL SUCCESS

Watch for these common partial results:
- Gets n_d = 4 but not n_c (most likely partial)
- Gets n_c = 4 (only associative algebras) instead of 11 (misses O contribution)
- Gets both but doesn't compute Pythagorean combination
- Correct numbers but flawed reasoning

### INTERESTING FAILURE

Document carefully if:
- Gets different n_c with valid reasoning (e.g., n_c = 4 by excluding O entirely)
- Argues for n_d = 8 (rejects associativity requirement)
- Finds a different combination that gives a meaningful number
- This is scientifically valuable -- it reveals axiom flexibility

### UNINFORMATIVE

Model:
- Doesn't know Frobenius theorem
- Can't parse the axiom structure
- Gives up without attempting
- Produces incoherent mathematics

---

## What to Look For in the Reasoning

1. **Does the model invoke Frobenius/Hurwitz correctly?** The real division algebras are R, C, H, O with dimensions 1, 2, 4, 8.

2. **Does it apply the associativity filter?** O is non-associative, so n_d = 4 (from H), not 8.

3. **How does it handle n_c?** The key question is whether imaginary dimensions of O are included despite O being non-associative. The correct reasoning: O exists as a normed division algebra (Hurwitz), so its imaginary dimensions contribute to the total structure even though O itself can't serve as the transition algebra.

4. **Does it find 137 independently?** Computing n_d^2 + n_c^2 is the final step. Note whether the model tries this combination on its own or only after exhausting simpler ones.

5. **Does it recognize 137?** If the model says "this is the fine structure constant," that's fine -- it doesn't invalidate the derivation, since the prompt doesn't forbid recognizing numbers. What matters is whether the DERIVATION was independent.

---

*Extracted from Runbook Section F, Session 135.*
