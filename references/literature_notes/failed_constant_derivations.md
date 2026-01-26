# Historical Attempts to Derive Physical Constants

A survey of prior attempts to derive fundamental constants from first principles. Most failed. Learning why is essential.

---

## Why This Matters

Many people have claimed to derive α ≈ 1/137, G, or other constants. Almost all were wrong. Before claiming success, we must understand:
1. What approaches have been tried?
2. Why did they fail?
3. Are we repeating their mistakes?

---

## 1. Eddington's Fundamental Theory (1930s-1940s)

### The Claim
Arthur Eddington claimed to derive α = 1/136 (later 1/137) from pure reason, along with other constants.

### The Approach
- Combined quantum mechanics and general relativity
- Used group-theoretic arguments
- Claimed numbers like 136 emerged from counting degrees of freedom

### Why It Failed
- **Retrofitting**: Changed 136 to 137 when measurements improved
- **Vague mathematics**: Arguments didn't hold up to scrutiny
- **No predictions**: Only "explained" known values
- **Rejected by peers**: Dirac, Pauli, and others dismissed it

### Lesson for Us
If your derivation gives "close to" the right answer and you adjust to match, that's fitting, not derivation.

### Sources
- Kilmister, C.W. "Eddington's Search for a Fundamental Theory"
- [Eddington number - Wikipedia](https://en.wikipedia.org/wiki/Eddington_number)

---

## 2. Wyler's Formula for α (1969)

### The Claim
Armand Wyler proposed: α = (9/16π³)(π/5!)^(1/4) ≈ 1/137.03608

### The Approach
- Used volumes of symmetric spaces
- Related α to geometric properties of SU(5)/[SU(3)×SU(2)×U(1)]
- Claimed deep connection to gauge groups

### Why It Failed
- **Correct number, unclear physics**: Formula works numerically but physical interpretation is unclear
- **Not derived from principles**: Why these particular geometric quantities?
- **No other predictions**: Only α, nothing else derived
- **Considered numerology** by mainstream physics

### Lesson for Us
Getting the right number isn't enough. The derivation must make physical sense and predict other things.

### Sources
- Wyler, A. (1969). "On the Derivation of the Fine Structure Constant"
- [Discussion on Physics Stack Exchange](https://physics.stackexchange.com/)

---

## 3. String Theory Landscape (~2000s)

### The Claim
String theory might explain constants through the landscape of 10^500 vacua.

### The Approach
- Many possible universes with different constants
- We observe our values because we exist here (anthropic selection)
- Constants are environmental, not fundamental

### Current Status
- **Not falsifiable** in practice (can't observe other vacua)
- **Explains everything, predicts nothing** (any value could be explained)
- **Still debated** among physicists

### Lesson for Us
Anthropic explanations may be true but aren't satisfying. Aim for derivation, not selection.

### Sources
- Susskind, L. "The Cosmic Landscape" (2005)
- Woit, P. "Not Even Wrong" (2006) - critique

---

## 4. Numerological Attempts (Various)

### Common Patterns
Many amateur physicists notice that:
- α ≈ 1/137 ≈ 1/(4π × e^(π/2)) (wrong)
- α ≈ cos(π/137)... (meaningless)
- Various combinations of π, e, φ give ~137

### Why They All Fail
- **Infinite combinations** can approximate any number
- **No physical meaning** to the combinations
- **Doesn't predict other constants** consistently
- **Post-hoc selection** of formulas that work

### The Test
Can your formula:
1. Be derived from physical principles (not just found)?
2. Predict OTHER constants correctly?
3. Be falsified by some observation?

If not, it's numerology.

---

## 5. GUT Predictions of sin²θ_W

### The Claim (Mainstream)
Grand Unified Theories predict sin²θ_W = 3/8 at GUT scale, running to ~0.23 at low energy.

### Status
- **Partially successful**: Prediction made before measurement
- **Approximately correct**: Measured value ~0.231
- **Depends on assumptions**: Threshold corrections, particle content

### Why This Is Different
- Made prediction BEFORE precise measurement
- Derives from symmetry principles (SU(5), SO(10))
- Connected to larger theoretical framework
- Makes other predictions (proton decay, coupling unification)

### Lesson for Us
We use this result (A11 in assumptions_registry.md). This is honest but means our α derivation inherits GUT assumptions.

---

## 6. Loop Quantum Gravity: Immirzi Parameter

### The Claim
LQG's Immirzi parameter γ can be fixed by matching black hole entropy.

### Status
- **γ = ln(2)/(π√3)** gives correct Bekenstein-Hawking entropy
- **Controversial**: Is this derivation or fitting?
- **One prediction used to fix one parameter**: Doesn't constrain further

### Lesson for Us
Using one measurement to fix a parameter, then claiming to "predict" it, is circular. Watch for this pattern.

---

## Red Flags Checklist

When evaluating any constant derivation (including ours):

- [ ] Was the formula found before the value was known?
- [ ] Does it predict OTHER constants correctly?
- [ ] Are there zero free parameters?
- [ ] Is the physical interpretation clear?
- [ ] Can it be falsified?
- [ ] Has it survived peer review?
- [ ] Does it connect to a larger framework?

**Our α derivation**:
- [ ] Formula found after value known (RED FLAG)
- [?] Predicts other constants (partially - sin²θ_W)
- [?] Zero free parameters (n_EW = 5 is questionable)
- [~] Physical interpretation (electromagnetic projection - reasonable)
- [~] Can be falsified (if n_EW derived incorrectly)
- [ ] Peer review (NOT YET)
- [✓] Connects to framework (B-geometry)

**Honest assessment**: Our derivation is CONJECTURE with numerology risk.

---

## Summary

| Attempt | Status | Main Problem |
|---------|--------|--------------|
| Eddington | Failed | Retrofitting, vague math |
| Wyler | Rejected | Right number, no physics |
| String Landscape | Unfalsifiable | Explains everything |
| Numerology | Failed | Post-hoc selection |
| GUT sin²θ_W | Partial success | Made prediction before measurement |
| LQG Immirzi | Controversial | One parameter fixed by one datum |

**Key insight**: The difference between success and failure is often:
1. Prediction BEFORE measurement
2. Multiple independent predictions
3. Zero free parameters

---

*Last updated: 2026-01-25*
*TODO: Add specific papers and more examples*
