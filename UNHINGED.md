# UNHINGED — Raw Idea Bucket

Append only. No structure required. Fragments OK. Don't self-censor.

---

## Aesthetics / Design Principles

- Want to articulate the "why" behind design choices someday
- Current north star: **as intuitive as possible**
- Strudel already nails this — lpf is lpf, you type notes and they sound like that
- Hard to beat that directness. So what does dollar-tee add on top?
- dollar-tee = **live DJing but with visuals**
- Strudel handles sound, dollar-tee handles the visual layer
- Goal: connect dollar-tee to Strudel someday (right now it's prototype stage)
- Strudel isn't technically hard (pattern algebra + Web Audio API + mini-notation parser) — so integration is feasible

---

## Workflow Meta

- Pipeline: **UNHINGED → IDEAS → TODO → PLAN → Actual impl**
- Each arrow = one Claude Code session
- Each session works with two adjacent md files
- This session (UNHINGED↔IDEAS): help dump raw ideas here, or port refined ones to IDEAS.md
- **Want this to be autonomous eventually** — an **agentic pipeline** / **multi-agent orchestration**
- Each arrow runs by itself: agent picks up one file, processes it, writes to the next, hands off
- No idea how to do it yet. Look into: CrewAI, LangGraph, AutoGen, OpenAI Swarm
- Or maybe just Claude Code with hooks/cron? TBD

---

## Timeline UI — FL Studio for Visuals

Use case: load a house track. Known BPM, known downbeat. No beat detection needed right now — you feed it the BPM and start info.

**The loop:**
- Set a loop length (e.g., 4 bars at 120 BPM = 8 seconds)
- Timeline is a horizontal strip that loops forever in sync with the music
- Time cursor sweeps across, wraps at the loop boundary
- Press "play" and it just goes

**Drawing on the timeline:**
- You draw intervals on it — kicks, builds, decays, whatever
- Colored blocks, maybe lanes/rows, like FL Studio's piano roll
- Name the intervals ("kick", "build", "drop")

**The big open question: how does the timeline wire to code?**

Several possible directions, not decided:

- **Intervals as values** — you draw a block called "kick", code gets a number.
  But what number? A boolean (on/off)? A progress (0→1 across the interval)?
  An envelope shape (attack/decay)?
- **Intervals as triggers** — entering an interval fires a callback.
  But then you need state management for what happens between triggers.
- **Intervals as time contexts** — inside a "kick" interval, `$t` means
  "time since this kick started." Magic but potentially confusing.
- **Some combination?** Maybe intervals expose multiple things:
  `kick.active` (bool), `kick.progress` (0→1), `kick.t` (local time)?

**More open questions:**
- How do you wire a specific interval to a specific cell's code?
- Can intervals overlap? What happens when they do?
- Is the timeline per-cell or global?
- How do you handle variations (e.g., every 4th kick is different)?
- Should intervals have "shapes" (linear ramp, ease-in, envelope curves)?

**Possible answer: intervals are just named variables with `.s` and `.e`.**

You draw an interval on the timeline UI, label it `$phase1`. Code gets:
- `$phase1.s` — start time
- `$phase1.e` — end time

That's it. No magic envelopes, no callbacks. You build everything with plain math:
```js
const progress = ($t - $phase1.s) / ($phase1.e - $phase1.s);
const eased = progress * progress;
const active = $t >= $phase1.s && $t < $phase1.e;
```

This keeps code as source of truth. The timeline UI is just a way to
visually set start/end times instead of typing numbers.

**BPM / beat detection for the test track:**
- Don't build beat detection ourselves (yet). Use existing DJ software or CLI tools
- DJ software (Rekordbox, Traktor, etc.) auto-detects BPM and writes it to ID3 `TBPM` tag
- Beat grid / downbeat position is trickier — stored in proprietary DBs (Rekordbox XML, Traktor NML), not in the audio file
- Simplest option: **aubio** (`brew install aubio`) — CLI tool, detects BPM + beat timestamps directly from audio
- For reading metadata in code: `music-metadata` (npm) or `mutagen` (Python)
- Goal: for now, just extract BPM + first downbeat for one specific test track. That's it.
- **Downbeat is hard.** BPM is standard metadata (ID3 `TBPM`), any library reads it. Downbeat position is NOT standard — DJ software keeps it in proprietary formats (Rekordbox XML, Traktor NML), not in the audio file.
- npm `music-metadata` = BPM only, no downbeat
- aubio (CLI) = BPM + beat positions from raw audio = best option for prototype

**Decided:**
- Naming: anything starting with `$` — `$kick`, `$build`, `$phase1`, whatever
- All intervals repeat. Every interval loops with the timeline. No one-shot intervals (for now)
- Units are seconds, absolute time
- Properties: `$kick.s` (start), `$kick.e` (end), `$kick.len` (= `.e - .s`, convenience)
- Implementation staging (no wiring vs wiring) is an impl concern, not a design concern

---

## Time Model — `$t` Semantics (Demoted from IDEAS)

Not ready to decide. Pushed back from IDEAS §2.

### The core question: what does `$t` mean?

**Path A — `$t` is always global.**
- `$t` = wall clock, always running, never resets. Sacred.
- All other times are named: `$loop`, `$kick`, `$bar`, `$slow`, etc.
- Pro: predictable, no magic. Con: verbose.

**Path B — `$t` is context time.**
- `$t` = whatever time is relevant to the current cell/loop/interval.
- Pro: `sin($t)` does "the right thing." Con: magic, confusing.

### The Many Times Problem
There are many times at once: global wall clock, loop time, kick time,
bar time, slow time, section time. Which one matters depends on context.

### VJ Deck Mental Model
This is a VJ equivalent of a DJ deck — timeline, loops, cue points,
plan future visuals while current ones render. Everything hand-coded live.

### Possible time variables
`$global`, `$loop`, `$kick`, `$beat`, `$bar`, `$slow`, user-defined (`$intro`, `$drop`).

**Note:** The interval model (`$kick.s`/`.e`/`.len`) might make this less
important — you get what you need from interval properties + plain math,
without needing special time semantics. TBD.

---

## Collaboration Granularity Problem

How do I tell the agent "do X amount of work and stop"?

Problem: I ask for a feature. The agent implements the whole thing in one shot.
That's technically correct — I asked for it. But it's too much at once. I want
to see the intermediate steps, try things, adjust before the next piece lands.
I'm afraid I'll need to adjust things, and now there's a whole chunk of code I
need to understand first.

But I also didn't say "stop after step 1" — so how would the agent know?

Possible solutions?
- Break the request down myself before asking? But part of the value is that
  the agent figures out the breakdown.
- Ask the agent to propose a plan first and let me pick which steps to do?
- Some kind of "show me what you'd do, then I'll say go"?
- A "step mode" — implement one piece, show me, wait for approval?
- Use the pipeline more strictly: NEXT_MOVES = one step at a time?

Core tension: I want the agent to think big (understand the full picture) but
act small (implement one reviewable piece at a time). Think ahead, ship in
increments.

---

## `val()` Inline Sliders

`val(current, min, max)` — a function that **just returns `current`**. That's it.
It's almost a no-op. The magic is purely in the editor: CodeMirror detects the
pattern and overlays a slider widget. Dragging the slider rewrites the source text.

The function is meaningless as code. It exists to invoke UI.

**Decided:**
- `val(50, 0, 100)` → returns `50`. Always returns first arg. Plain passthrough.
- 3 args = always float (no step). `val(0.5, 0, 1)` gives continuous float slider.
- 4 args = step size. `val(50, 0, 100, 1)` = integer steps. `val(0.5, 0, 1, 0.1)` = 0.1 steps.

**Decided:**
- Slider appears as a **popover** (floating UI anchored to the `val(...)` expression).
  Click on `val(50, 0, 100)` → popover with slider appears below it.
  Drag slider → `50` in source updates live. Click elsewhere → popover dismisses.
- In CodeMirror, this is a **tooltip widget** — CM has a built-in tooltip system for this.

**Still open:**
- Naming — anonymous (`val(50,0,100)`) or labeled (`val("radius", 50, 0, 100)`)?
  Or infer label from variable name (`const r = val(50,0,100)` → label "r")?
- Live update — re-eval every frame while dragging? Or debounced?

---

## UI Framework: Vanilla JS vs Framework

- Currently: pure vanilla JavaScript. No framework.
- Canvas rendering doesn't care — you're calling `ctx` directly either way.
- The question is the **UI around the canvas** — timeline, controls, panels, draggable intervals.
- **Stay vanilla for now.** Switch when it hurts (i.e., when you're manually syncing DOM state everywhere).
- When the time comes, the category is called **frontend frameworks**. Options:
  - **React** — biggest ecosystem, most jobs, heaviest
  - **Solid.js** — React-like API but no virtual DOM, very fast, lighter
  - **Svelte** — compiles away the framework, minimal runtime, clean syntax
  - **Vue** — middle ground, gentle learning curve
- For a live-performance tool, lighter is better. Solid.js or Svelte would be natural picks over React.

---

## Declarative Rendering — Mathematica `Graphics[]` Style

- Canvas API sucks for this. It's an imperative state machine — push the pencil around, save/restore, beginPath, etc.
- Want: **Mathematica `Graphics[]` style** — declarative, feed it shapes and directives in a flat/nested list
- Key Mathematica concept: **scoping by list nesting**
  - Directives (color, thickness, etc.) apply to everything after them in the same list
  - Nest a sublist = new scope. When the sublist ends, the directive disappears
  - No explicit save/restore, no state management. The structure IS the scoping.
- Example of what we want:
  ```js
  return [
    fill('red'), circle(0, 0, 50),
    fill('blue'), rect(10, 10, 30, 30),
    [fill('green'), lineWidth(3),   // green+thick scope starts
      line(0, 0, 5, 5),
      circle(2, 2, 1),
    ],                               // scope ends, back to previous style
    line(0, 0, 1, 1),                // no longer green or thick
  ]
  ```
- We already have the basics (declarative mode with `fill()`, `circle()`, etc.)
- **Missing piece: nested list scoping.** The renderer needs to handle subarrays as scoped groups.
- Heterogeneous lists — mix directives and shapes freely, just like Mathematica

---

## Memory Portability

- Claude Code memories live in `~/.claude/projects/.../memory/` — local to this laptop.
- If I work from another machine, memories don't follow.
- Options:
  - Commit memories into the repo (e.g., `.claude/memory/` + `CLAUDE.md` reference). Travels with code. In git history though.
  - Sync `~/.claude/` across machines (iCloud, Dropbox, symlink).
  - Just don't worry about it if this is the main dev machine.
- Decide later.

