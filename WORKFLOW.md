# WORKFLOW — How We Work

## The Problem
Ideas come faster than code. Mental picture is coherent but words/code lag behind.
If we try to implement everything at once, nothing ships. If we only brainstorm,
nothing gets built.

## The Pipeline

Five stages, increasing concreteness:

```
UNHINGED.md → IDEAS.md → NEXT_MOVES.md → PLAN.md → Code
(raw dump)    (sorted)    (committed)     (spec)    (shipped)
```

### UNHINGED.md — The Idea Bucket
- Raw, unfiltered idea dumps. Fragments OK. No structure required.
- Append only. Never delete. Don't self-censor.
- You dictate, CC agent transcribes. Or type directly.

### IDEAS.md — Sorted Ideas with Tradeoffs
- Ideas graduate here from UNHINGED when they're coherent enough to discuss.
- Each idea has context, tradeoffs, open questions.
- Not yet committed to build — still exploring.

### NEXT_MOVES.md — The Hinged Subset
- Small, concrete set of ideas we commit to implementing *next*.
- Each item: what to build, why it matters, how to verify.
- Must be specific enough to code. If still fuzzy, stays in IDEAS.

### PLAN.md — Implementation Details
- Full technical spec for the current NEXT_MOVES items.
- Architecture, file structure, data flow, API design.
- Read by the agent doing the actual programming.

### Code — Shipped
- Actual implementation. Test it. See if it works. Iterate.

## The Cycle
1. **Brainstorm** → dump into UNHINGED
2. **Sort** → promote coherent ideas to IDEAS, discuss tradeoffs
3. **Commit** → pick 1-3 items for NEXT_MOVES
4. **Plan** → write implementation details in PLAN
5. **Build** → code it, test it, ship it
6. **Reflect** → did it make the workflow easier? Loop back.

## Future
- CC skill/agent for each stage (e.g., `/dump` appends to UNHINGED,
  `/plan` generates PLAN from NEXT_MOVES). See IDEAS.md.
