# Expert Outreach Guide

**Created**: 2026-01-28 (Session 120 - Red Team Review)
**Purpose**: Systematic approach to getting expert feedback
**Goal**: Find ONE expert who engages substantively

---

## Strategy

**Don't ask**: "Is my theory correct?"
**Do ask**: "Is this specific mathematical claim valid?"

Lead with METHODOLOGY, not results. Be explicit about amateur status.

---

## Target Experts

### Tier 1: Division Algebra Specialists

| Name | Affiliation | Why Relevant | Contact Approach |
|------|-------------|--------------|------------------|
| **John Baez** | UC Riverside | Wrote "The Octonions"; engages publicly | Blog comment or email |
| **Cohl Furey** | Cambridge (?) | Division algebras → SM program | Academic email |
| **Latham Boyle** | Perimeter Institute | Division algebras in physics | Academic email |
| **Garrett Lisi** | Independent | E8 experience; knows pattern-matching risks | Direct email |

### Tier 2: Mathematical Physicists

| Name | Affiliation | Why Relevant | Contact Approach |
|------|-------------|--------------|------------------|
| Pierre Ramond | U Florida | Octonions in physics | Academic channels |
| Michael Duff | Imperial | M-theory, division algebras | Conference or email |

### Tier 3: Online Communities

| Platform | Best For | Approach |
|----------|----------|----------|
| Physics Stack Exchange | Specific technical questions | Well-posed question with work shown |
| MathOverflow | Pure math questions | Division algebra structure queries |
| r/physics | Informal feedback | Expect skepticism |

---

## Question Templates

### Template 1: Division Algebra Structure

**Subject**: Question about octonion decomposition under quaternionic subalgebra

**Body**:
```
Dear Prof. [Name],

I'm an amateur investigating mathematical structures in physics using LLM assistance. I have a specific question about division algebras that I hope you might help clarify.

QUESTION: When octonions are viewed from the perspective of a quaternionic subalgebra, do they decompose as two copies of H (giving dimension 4+4=8), and is there a standard name for this decomposition?

CONTEXT: I'm trying to understand whether the quantity n_c = 1+2+4+4 = 11 (rather than 1+2+4+8 = 15) has mathematical justification in division algebra theory.

I've consulted your paper "The Octonions" but couldn't find this specific decomposition discussed.

Any pointers to relevant literature would be greatly appreciated.

Best regards,
[Name]
```

### Template 2: Cyclotomic Polynomial Question

**Subject**: Cyclotomic polynomials in division algebra contexts

**Body**:
```
Dear Prof. [Name],

I'm investigating numerical patterns in physics constants and have noticed that Φ₆(x) = x² - x + 1 appears repeatedly when x is related to division algebra dimensions.

SPECIFIC QUESTION: Is there any known connection between the 6th cyclotomic polynomial and division algebras (R, C, H, O)?

CONTEXT:
- Φ₆(11) = 111 appears in fine structure constant formulas
- Φ₆(12) = 133 appears in Weinberg angle formulas
- 11 and 12 are related to R+C+H+O dimensions

I suspect this may be coincidence, but wanted to check if there's established mathematics here.

Thank you for any guidance.

Best regards,
[Name]
```

### Template 3: Statistical Methodology

**For statistician**:

**Subject**: Multiple testing methodology for physics constant matching

**Body**:
```
Dear [Name],

I'm seeking feedback on a statistical methodology for evaluating numerical coincidences.

SETUP: I have ~30 base numbers and ~50 physics constants. Using combinations (sums, products, ratios), I found 3 matches at sub-ppm precision (< 10⁻⁵).

QUESTION: Is my "flexibility test" methodology sound?
1. Generate random target values
2. Attempt to match using same base numbers
3. Measure success rate at each precision level
4. Compare actual matches to random baseline

RESULT: At sub-ppm precision, random matching succeeds 0% of the time in my tests, while the actual framework achieves 3 matches.

CONCERN: Have I correctly accounted for the search space? Is Bonferroni correction needed?

I can share the Python code for review.

Thank you,
[Name]
```

---

## Outreach Log

| Date | Target | Method | Question | Response | Outcome |
|------|--------|--------|----------|----------|---------|
| | | | | | |

---

## Response Handling

### If Positive Response

1. **Be gracious** — thank them for their time
2. **Be specific** — ask focused follow-up questions
3. **Share credit** — acknowledge their input in documentation
4. **Don't oversell** — don't claim "endorsement" from a helpful reply

### If Negative/Dismissive Response

1. **Be gracious** — thank them anyway
2. **Ask for specifics** — "What specifically is the error?"
3. **Learn from it** — document criticism in Red Team findings
4. **Don't argue** — accept their assessment professionally

### If No Response

1. **Wait 2 weeks** before any follow-up
2. **One follow-up max** — then move on
3. **Try different experts** — not everyone will engage

---

## Success Criteria

**Minimum goal**: ONE substantive technical response from ONE expert

**Ideal outcome**: Expert identifies specific error or confirms specific claim

**What counts as success**:
- "Your claim about G₂ → SU(3) is standard" ✓
- "Your Φ₆ usage has no known basis" ✓ (useful negative)
- "This is interesting, worth investigating" ✓

**What doesn't count**:
- "This is crackpot" (no specifics)
- No response
- "I don't have time"

---

## Timeline

| Week | Action |
|------|--------|
| 1 | Draft questions, identify 3 target experts |
| 2 | Send first outreach (ONE expert) |
| 3-4 | Wait for response |
| 5 | If no response, try second expert |
| 6-8 | Continue cycle |

**Patience is essential.** Experts are busy. One response per month is realistic.

---

*Expert feedback is the path to legitimacy. Approach it systematically and professionally.*
