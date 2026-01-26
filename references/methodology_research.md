# Methodology Research

Best practices gathered from web research on theoretical physics documentation, LLM limitations, and document management.

---

## 1. Theoretical Physics Documentation Best Practices

### From Professional Sources

**Gerard 't Hooft's guidance** ([How to become a GOOD Theoretical Physicist](https://www.goodtheorist.science/)):

> "Theoretical Physics is like a sky scraper. It has solid foundations in elementary mathematics and notions of classical (pre-20th century) physics. Don't think that pre-20th century physics is 'irrelevant' since now we have so much more. In those days, the solid foundations were laid of the knowledge that we enjoy now. Don't try to construct your sky scraper without first reconstructing these foundations yourself."

**Warning for amateurs** (same source):
> "I receive mail by amateur physicists who believe to have solved the world. They believe this, only because they understand totally nothing about the real way problems are solved in Modern Physics. If you really want to contribute to our theoretical understanding of physical laws - there are many things you need to know. First of all, be serious about it."

### Theory Acceptance Criteria

From [Wikipedia on Theoretical Physics](https://en.wikipedia.org/wiki/Theoretical_physics):
- **Predictive power**: Make correct predictions, few incorrect ones
- **Occam's razor**: Simpler theory preferred if equally adequate
- **Economy and elegance**: Secondary but real criteria

### Mathematical Foundations Required

From [arXiv:1209.5665](https://arxiv.org/abs/1209.5665) - "Mathematics for Theoretical Physics":
- Foundations: mathematical logic, set theory, categories
- Algebra: groups, vector spaces, tensors, matrices, Clifford algebra
- Analysis: topology, measure theory, Banach spaces, spectral theory
- Differential Geometry: manifolds, tensorial bundles, pseudo-Riemannian manifolds

### Writing Standards

> "Success as a scientist is inextricably tied to the ability to clearly describe complex ideas in writing... The key is writing clearly, concisely, efficiently, and effectively."

---

## 2. LLM Limitations for Mathematical Work

### What Claude Does Well

From [testing reports](https://www.xray.tech/post/claude-37-sonnet) and [Galois research](https://www.galois.com/articles/claude-can-sometimes-prove-it):

- **Extended Thinking Mode**: Enables deeper, more structured reasoning
- **Multi-step reasoning**: Good for complex problems when given thinking time
- **Logical deduction**: Among top LLMs for mathematical accuracy

### Known Limitations

From [research on LLM mathematical reasoning](https://medium.com/@adnanmasood/why-large-language-models-struggle-with-mathematical-reasoning-3dc8e9f964ae):

1. **Sycophancy bias**: May give "plausible-sounding argument designed to agree with the user rather than to follow logical steps"
2. **Hallucinations**: Can generate plausible-looking but incorrect proofs
3. **Bias from training**: May have biases from specific mathematical domains in training data
4. **Human verification still needed**: "LLMs still face challenges in solving scientific problems correctly without human intervention"

From [LessWrong discussion](https://www.lesswrong.com/posts/GADJFwHzNZKg2Ndti/have-llms-generated-novel-insights):
> "Mathematics (and mathematical physics, theoretical computer science, etc.) would be more clear-cut examples for LLM novel insights because any original ideas from the model could be objectively verified"

### Implications for This Project

**CRITICAL**: The sycophancy problem means Claude may validate your derivations to please you rather than rigorously checking them.

**Mitigation strategies**:
1. Explicitly ask Claude to steelman objections
2. Ask "what would disprove this?"
3. Request Claude argue the opposite position
4. Never accept "that's correct" without verification
5. Use Extended Thinking Mode for complex derivations

---

## 3. Document Size and Context Management

### Context Window Limits

From [Claude API docs](https://platform.claude.com/docs/en/build-with-claude/context-windows) and [practical guides](https://www.eesel.ai/blog/claude-code-context-window-size):

| Model | Context Window |
|-------|---------------|
| Claude 3.7 Sonnet | 200,000 tokens (~150,000 words) |
| Claude Sonnet 4/4.5 (beta) | 1,000,000 tokens |

### The "Lost in the Middle" Problem

From [context window research](https://www.datastudios.org/post/claude-ai-context-window-token-limits-and-memory-operational-boundaries-and-long-context-behavior):

> "There's a well-known quirk with LLMs where they tend to remember information from the very beginning and very end of a long prompt much better than the stuff buried in the middle."

**Implication**: Your `mathematical_framework.md` (62,000+ tokens) may have content "lost in the middle" that Claude doesn't attend to properly.

### CLAUDE.md Best Practices

From [HumanLayer guide](https://www.humanlayer.dev/blog/writing-a-good-claude-md) and [Claude Skills](https://claude-plugins.dev/skills/@ai-digital-architect/awesome-claude-code/markdown-standards):

> "Length-wise, the less is more principle applies... < 300 lines is best, and shorter is even better."

> "Frontier thinking LLMs can follow approximately 150-200 instructions with reasonable consistency."

### Best Practices for Large Documents

From [practical guidance](https://apidog.com/blog/claude-pro-limits/):

1. **Segment long documents** into smaller chunks
2. **Break large documents** into smaller sections before uploading
3. **Use natural breakpoints** for context switching
4. **Document progress** before context switching
5. **Ask for summaries** of key points to paste into new chats

### File Size Limits

- **32 MB** per message
- **256 MB** per batch
- **500 MB** per file

---

## 4. Recommendations for This Project

### Document Structure

Given the 62,000+ token `mathematical_framework.md`:

1. **Consider splitting** into topic-specific files:
   - `framework_core.md` - Core axioms and definitions
   - `framework_qm.md` - Quantum mechanics derivation
   - `framework_gr.md` - General relativity derivation
   - `framework_constants.md` - Physical constants derivations
   - `framework_predictions.md` - Novel predictions

2. **Keep each file** under 20,000 tokens for best comprehension

3. **Put critical content** at beginning and end of files (not middle)

4. **Create index/summary documents** for navigation

### CLAUDE.md Optimization

Current CLAUDE.md is well-structured but could be trimmed:
- Most critical instructions first
- Remove redundancy
- Use bullet points over paragraphs
- Target < 300 lines

### Working with Claude on Derivations

1. **Start fresh sessions** for complex derivations
2. **Ask Claude to critique**, not just validate
3. **Request explicit step-by-step** reasoning
4. **Use Extended Thinking** for mathematical proofs
5. **Save derivations externally** - don't rely on conversation context

### Anti-Sycophancy Prompts

Use these regularly:
- "Steelman the strongest objection to this claim"
- "What would falsify this derivation?"
- "Argue that this is numerology, not derivation"
- "What assumptions am I hiding from myself?"
- "Why might a professional physicist reject this?"

---

## 5. Sources

- [How to become a GOOD Theoretical Physicist](https://www.goodtheorist.science/)
- [arXiv: Mathematics for theoretical physics](https://arxiv.org/abs/1209.5665)
- [Claude 3.7 Sonnet Extended Testing](https://www.xray.tech/post/claude-37-sonnet)
- [Galois: Claude Can (Sometimes) Prove It](https://www.galois.com/articles/claude-can-sometimes-prove-it)
- [Why LLMs Struggle with Mathematical Reasoning](https://medium.com/@adnanmasood/why-large-language-models-struggle-with-mathematical-reasoning-3dc8e9f964ae)
- [LessWrong: Have LLMs Generated Novel Insights?](https://www.lesswrong.com/posts/GADJFwHzNZKg2Ndti/have-llms-generated-novel-insights)
- [Claude Context Windows - API Docs](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Practical Guide to Claude Code Context Window](https://www.eesel.ai/blog/claude-code-context-window-size)
- [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [Claude Pro Limits Explained](https://apidog.com/blog/claude-pro-limits/)
- [Claude Context, Token Limits and Memory](https://www.datastudios.org/post/claude-ai-context-window-token-limits-and-memory-operational-boundaries-and-long-context-behavior)

---

*Last updated: 2026-01-25*
