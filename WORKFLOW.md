# WORKFLOW — How We Work

## The Problem
Ideas come faster than code. Mental picture is coherent but words/code lag behind.
If we try to implement everything at once, nothing ships. If we only brainstorm,
nothing gets built.

## How It Actually Works

```
UNHINGED.md → IDEAS.md → Code
(raw dump)    (crystallized)  (shipped)
```

### UNHINGED.md — Permission to Think Out Loud
The name is the feature. "Unhinged" means: don't self-censor, don't organize, don't worry about quality. Fragments, half-thoughts, contradictions — all fine. The psychological barrier to writing ideas down is real. Calling it "unhinged" removes that barrier.

- Raw, unfiltered idea dumps
- Append only. Never delete.
- Voice-transcribed ramblings welcome

### IDEAS.md — When Things Crystallize
Ideas graduate here when they've been discussed enough to have shape — tradeoffs identified, open questions listed, maybe a rough design. Still not committed to build.

### Code — When It's Time to Build
When an idea is ready, we just build it. A `PLAN-*.md` file might get created for a specific branch if the change is big enough (like `PLAN-p5-backend.md`), but there's no mandatory planning stage. Plans are per-branch, not a pipeline step.

### What Didn't Work
NEXT_MOVES.md and a permanent PLAN.md were aspirational structure that never got used. The actual flow is: talk about an idea → it gets clear enough → build it. Forcing intermediate stages added friction without value.

## Collaboration Granularity

**Core tension:** I want the agent to think big (understand the full picture) but act small (implement one reviewable piece at a time). Think ahead, ship in increments.

When I ask for a feature, the agent sometimes implements the whole thing in one shot. Technically correct — I asked for it. But it's too much at once. I want to see intermediate steps, try things, adjust before the next piece lands.

What helps:
- Agent proposes a plan first, I pick which steps to do
- Subagents for parallelizable work
- Surface major design decisions before implementing
- Don't batch — mark tasks done as you go

## Verification — The Eyeballing Problem

**Current state:** After code changes (especially rendering changes), the only way to verify correctness is to manually eyeball every demo. This is:
- **Slow** — click through each demo, visually compare
- **Error-prone** — subtle changes (line thickness, font size, coordinate shifts) are easy to miss
- **Scales badly** — more demos = more eyeballing

**What happened:** The p5.js backend port changed stroke caps (ROUND vs butt), text rendering (font size defaults), and coordinate scaling (pixel density). Each broke visuals subtly. Found them only by accident while looking at something else.

**What I want:**
- **Visual regression testing** — snapshot each demo, compare before/after automatically
- Diff should highlight pixel differences, not just pass/fail
- Should run on every code change that touches the renderer
- Doesn't need to be CI — local is fine for now. But automated, not manual.

**Possible approaches:**
- Screenshot each demo with headless browser (Playwright, Puppeteer), compare with pixel diff
- Canvas `toDataURL()` → save as reference PNGs → diff on next run
- Perceptual diff (not just pixel-exact) to tolerate antialiasing differences
- A `/test-visual` script that runs all demos and reports diffs

**Key insight:** This is a rendering engine now. Rendering engines need visual regression tests. The demos ARE the test suite — they just need automated screenshots and comparison.

## Autonomous Agentic Pipeline (Future)

Want the idea triage to be autonomous eventually — agent picks up raw ideas, processes them, sorts them, hands off. Maybe Claude Code with hooks/cron. TBD.
