# Skepticism Checklist

## Before Adding Any Derivation

Run through this checklist EVERY TIME:

- [ ] **State assumptions explicitly** - What are we assuming that isn't proven?
- [ ] **Identify logical gaps** - Where does the argument skip steps?
- [ ] **Check for circularity** - Are we assuming what we're trying to prove?
- [ ] **Find alternatives** - Could different assumptions yield the same result?
- [ ] **Quantify precision** - "Order of magnitude" ≠ "derived"

## Red Flags (Stop and Investigate)

### 1. The Eddington Trap
Getting fundamental constants from combinations of integers and π.

**Warning sign**: Formula like `α = (some integers) × π^n`

**Test**: Does the derivation work for ALL constants, or just the one you're fitting?

### 2. The Anthropic Dodge
"The universe must be this way for observers to exist."

**Warning sign**: "If α were different, we wouldn't be here to ask."

**Test**: Is this explanatory, or just restating the question?

### 3. The Dimension Shuffle
Getting right answers by combining quantities with matching dimensions.

**Warning sign**: Answer has right units but derivation feels arbitrary.

**Test**: Do the physical interpretations make sense, not just the units?

### 4. The Confirmation Bias Loop
Remembering derivations that work, forgetting ones that fail.

**Warning sign**: "This is the one that worked" without mentioning what was tried.

**Remedy**: Always document failed attempts in `archive/deprecated/`.

### 5. The Precision Illusion
Reporting "0.7% accuracy" when derivation has order-one uncertainties.

**Warning sign**: Final precision better than any intermediate step.

**Test**: Propagate uncertainties honestly through every step.

## When Results Seem "Too Good"

This is a WARNING SIGN. Immediately investigate:

1. **Am I fitting to known data?**
   - Did I adjust anything after seeing the answer?
   - Would I have predicted this BEFORE knowing the measurement?

2. **Are there hidden degrees of freedom?**
   - Count parameters honestly
   - "Natural" choices are often hidden parameters

3. **Is this mathematical necessity or numerical coincidence?**
   - Would a different framework produce the same number?
   - How special is this result?

4. **What prior work reached similar conclusions?**
   - Check literature for failed attempts
   - Why didn't previous "derivations" stick?

## Numerical Claims Checklist

For ANY claim like "α ≈ 1/137":

- [ ] Full derivation shown with no hidden steps
- [ ] Free parameters counted (should be ZERO)
- [ ] Calculated what α WOULD BE if assumptions change by 10%
- [ ] Compared to other "derivations" in physics history
- [ ] SymPy script written and PASSED
- [ ] Documented in `derivations_summary.md`

## Questions to Ask About Every Derivation

1. **Is "perspective" actually doing work?**
   Could any structure with the right symmetries yield the same result?

2. **Is the derivation unique?**
   Or are there many paths to this number?

3. **What's actually predicted?**
   Not "explained after the fact" but predicted BEFORE observation?

4. **What would falsify this?**
   What observation would make you abandon this claim?

## The Crackpot Detector

From John Baez's Crackpot Index — watch for these in our own work:

- Claiming "simple" when the derivation has hidden complexity
- Ignoring established physics that contradicts the claim
- Multiple ad-hoc assumptions that happen to give the right answer
- Inability to predict anything that wasn't already known
- Treating numerical coincidences as deep truths

## Required Reading (Keep Perspective)

- Feynman, "Cargo Cult Science"
- Woit, "Not Even Wrong"
- Hossenfelder, "Lost in Math"
- Baez, "The Crackpot Index"
