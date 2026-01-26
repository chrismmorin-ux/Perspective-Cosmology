# Consolidation Template

**Purpose**: Standard process for integrating investigation content into atomic structure

---

## When User Says "Ready to Consolidate [filename]"

### Step 1: Read and Analyze
- Read the full document
- Identify: What type of content?
  - New AXIOM? → AXM_01xx
  - New DEFINITION? → DEF_02xx
  - New THEOREM/LEMMA? → THM/LEM_04xx
  - New IMPORT? → IMP_06xx
  - New CONJECTURE? → CNJ_08xx
  - New DERIVATION? → DRV_0Axx

### Step 2: Extract Atomic Units
For each extractable unit:
1. Assign next available tag from registry
2. Create atomic file using ATOMIC_TEMPLATE.md
3. Fill in Requires/Provides
4. Update tag_registry.md

### Step 3: Build Continuation Prompt
Ask: "If this investigation continued, what would it ask next?"
Write prompt as if the investigator doesn't know about structure.

Example format:
```
CONTINUATION PROMPT for [investigation]:

Context: [Brief summary of what was established]

The investigation reached [stopping point]. The next questions are:
1. [Question 1]
2. [Question 2]

Suggested approach: [How to proceed]

Key uncertainties: [What remains unclear]
```

### Step 4: Create Work Items
For each open question or next step:
1. Add to potential_work.md
2. Assign score (1-5)
3. Assign category
4. Link to source investigation

### Step 5: Archive or Update Source
- If fully extracted → move to archive/investigations/
- If partially extracted → add note at top linking to atomic files
- If still active → leave in place with status update

### Step 6: Commit
```
Consolidate [investigation_name]: Extract [N] atomic units

- [TAG]: [description]
- [TAG]: [description]
- Added [M] work items to potential_work.md

Source: framework/investigations/[file]
```

---

## Checklist for Each Consolidation

- [ ] Document read completely
- [ ] All CANONICAL content extracted to atomic files
- [ ] All ACTIVE content noted with work items
- [ ] Tag registry updated
- [ ] Continuation prompt written
- [ ] Work items scored and categorized
- [ ] Source file handled (archived/annotated)
- [ ] Committed with clear message
