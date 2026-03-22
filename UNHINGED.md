# UNHINGED — Raw Idea Bucket

Append only. No structure required. Fragments OK. Don't self-censor.

---

## Strudel / Integration Notes

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

---

## Easing Library — Want It Rich

Want a comprehensive easing library. Easing functions are core to making
animations feel good — they map progress (0→1) to a shaped output.
What do the cool animation people actually use?

### Standard Curves (Robert Penner's — the industry standard)

11 curves × 3 flavors (in/out/in-out) = 33 functions:
- **Linear** — constant speed, `t`
- **Quad** — gentle, `t²`
- **Cubic** — the default "smooth", `t³`
- **Quart** — snappier, `t⁴`
- **Quint** — very snappy, `t⁵`
- **Sine** — softest, organic, `1 - cos(t·π/2)`
- **Expo** — dramatic, almost instant at one end, `2^(10(t-1))`
- **Circ** — circular arc feel, `1 - √(1-t²)`
- **Back** — overshoots then settles (slingshot)
- **Elastic** — spring wobble (damped sine wave)
- **Bounce** — ball-drop bounce (piecewise parabolas)

### Beyond Penner

- **Cubic bezier** (CSS-style) — `cubicBezier(0.25, 0.1, 0.25, 1.0)`.
  4 control points, infinite curves. Designers hand you bezier values.
- **Spring physics** — `spring({ stiffness, damping, mass })`.
  Not a fixed curve, a simulation. Can overshoot/oscillate. Framer Motion style.
- **Steps / quantized** — `steps(4)`. Discrete jumps. Retro, clock-tick feel.
- **Composition** — reverse, mirror (ping-pong), chain, scale, sequence.
- **Custom keyframe curves** — draw control points, interpolate. Like a DAW automation lane.

### Best Practices — Pick by Intent

- "Something appears" → ease-out (arrives fast, settles)
- "Something disappears" → ease-in (starts slow, exits fast)
- "A to B movement" → ease-in-out
- "Impact / attention" → elastic or back
- "Rhythmic pulse" → sine or expo

### For Music / VJ Specifically

- **Kick hit** → `easeOutExpo` (instant impact, fast decay) or `easeOutElastic` (wobble)
- **Build-up** → `easeInQuad` or `easeInCubic` (slow start, rising tension)
- **Drop** → `easeOutBounce` or hard step
- **Slow drift** → `easeInOutSine` (organic, barely noticeable)
- **Strobe** → `steps(1)` or `t < 0.1 ? 1 : 0`

### Common Patterns

```js
// ping-pong: up then back down
const ping = t < 0.5 ? ease(t * 2) : ease(1 - (t - 0.5) * 2);

// loop-friendly breathing
const breathe = sin(t * TAU);

// stagger: offset same easing for N elements
for (let i = 0; i < n; i++) {
  const staggered = ease(clamp(t * n - i, 0, 1));
}
```

### The 80/20

Pros use cubic bezier or spring 80% of the time. Penner for the other 20%.
Custom keyframe curves are rare.

### Open Question

Pure easing goes 0→1 in, 0→1 out. But in practice you always need to convert
from interval time to progress, and from eased progress to actual values.
That's boilerplate every time. Need a good convenience API on top of pure easings.
See IDEAS for the two approaches we like.

---

## Examples Are Too Imperative

- The existing demo sketches use imperative Canvas style (ctx.fillRect, ctx.beginPath, etc.)
- They work, but they don't showcase the declarative mode we're building
- Need to rewrite/add examples that use the declarative style (return arrays of shapes + directives)
- This is also a test of whether the declarative API is actually pleasant to use

---

## Coordinate System — Pixel vs Mathematical

- Canvas default: pixel coordinates. Origin top-left, Y goes down. Gross for math.
- Want: **mathematical coordinates**. Origin at center (or wherever), Y goes up, units are abstract (not pixels).
- The term is **viewport** or **coordinate transform** — mapping from "math space" to pixel space.
- Mathematica does this: `PlotRange -> {{-1, 1}, {-1, 1}}` and it maps to whatever pixel size the window is.
- Want something like: "my world is -1 to 1 in both axes" and shapes just go there, regardless of canvas pixel size.
- Canvas can do this with `ctx.setTransform()` under the hood — flip Y, scale, translate origin.
  - But the declarative renderer should handle this automatically. User thinks in math coords, renderer maps to pixels.


### `table()` — Mathematica-style iteration inside `render()`

Want to avoid for loops inside render. Mathematica's `Table[expr, {i, n}, {j, m}]` is beautiful because `{i, n}` keeps the iterator and its range together. JS separates them. Annoying.

**Winner: Option B with syntactic sugar.** (Options A–H explored and rejected — see git history.)

Best pure-JS version (slight repetition):
```js
table({i: 8, j: 8}, ({i, j}) => [
  circle(i * 50, j * 50, 20),
])
```

Zero-repetition version (needs compiler/preprocessor sugar):
```js
table({i: 8, j: 8}, _ => [
  circle(i * 50, j * 50, 20),
])
```
The `_` signals "auto-destructure from the object keys." Preprocessor rewrites it.

**Range syntax for the object:**
- `{i: 8}` — i from 1 to 8
- `{i: [3, 10]}` — i from 3 to 10
- `{i: [3, 10, 2]}` — i from 3 to 10, step 2
- `{i: {from: 3, to: 10, step: 2}}` — same, fully spelled out

**Zero repetition requires syntactic sugar** — a preprocessor step that sees the `_` placeholder and auto-injects the object keys as variables. Not a big lift since user code already goes through `new Function()` compilation.

---

## Chaining Over `table()` — Legible Data Flow

`table()` is opaque. Everything happens inside one callback — ranges, derived values, shape construction. You can't see intermediate state. Zero idea what `angle` spans from/to.

```js
// BAD: opaque, have to trace the math in your head
table({i: [0, 59]}, ({i}) => {
  const angle = (i / 60) * TWO_PI + t * 0.5
  return [
    fill(Color.rainbow(i / 60)), noStroke(),
    circle(cx + cos(angle) * ringR, ringY + sin(angle) * ringR * 0.4, 8),
  ]
})
```

Instead, chain. Each step is a checkpoint you can read (or inspect).

```js
// GOOD: each step is legible
ts = subdivide({t: {from: 0, to: 1, size: 60}})

tas = ts.map(({t}) => ({t, angle: lerp(minAngle, maxAngle, t)}))

circles = tas.map(({t, angle}) => [
  fill(Color.rainbow(t)), noStroke(),
  circle(vec2(cx, ringY) + vec2(cos(angle), sin(angle) * 0.4) * ringR, 8),
])

render(circles)
```

**Why this is better:**
1. `subdivide()` — you see the range, you know what `t` is
2. `.map()` to derive — you see exactly how `angle` relates to `t`
3. `.map()` to shapes — inputs are named and understood
4. `render()` — done

Each step is a checkpoint. The user never holds the whole pipeline in their head at once. That's 배려.

**Needs:**
- `subdivide({name: {from, to, size}})` — generates array of objects with evenly-spaced values
- `mapAppend` or `mapWith` — adds fields to each object without destructure-and-reconstruct boilerplate. Something like `ts.mapWith(({t}) => ({angle: lerp(min, max, t)}))` that merges the new fields in.
- Vec2 arithmetic: `vec2 + vec2`, `vec2 * scalar` — so the shape line reads like math, not like `cx + cos(angle) * ringR`

---

## Vector Easing

- Current easing is scalar (one number, 0→1→mapped value)
- Want: **vector easing** — ease a whole point/vector at once
- `tween($kick, [0, 0], [100, 200], easeOutCubic)` → returns `[x, y]`
- Useful for position, color, any multi-dimensional value
- Should just work component-wise? Or path-based (curved trajectories)?

---

## Draggable Cue Points on Canvas — Mathematica `Locator` Style

Like Mathematica's `Locator[]` — place draggable points directly on the canvas, access them in code.

- Click on the canvas to place a **cue point**
- Each cue gets a `$`-name: `$p1`, `$center`, `$target`, whatever
- Access in code: `$p1.x`, `$p1.y`
- Drag them around live → code updates in real time
- It's `val()` but for 2D positions — the canvas IS the slider

```js
// $p1 and $p2 are draggable points placed on the canvas
render(
  line($p1.x, $p1.y, $p2.x, $p2.y),
  circle($p1.x, $p1.y, 10),
  circle($p2.x, $p2.y, 10),
)
```

- Same philosophy as `val()`: code is source of truth, UI just provides a way to set values visually
- Same philosophy as timeline intervals: `$`-named variables wired from UI to code
- **Pattern emerging**: `$` prefix = "value controlled by UI, not by code"
  - `$kick.s` / `$kick.e` — from timeline
  - `$p1.x` / `$p1.y` — from canvas locators
  - `val()` — from inline sliders
  - All the same idea: UI ↔ code binding

---

## Color Schemes as Functions — `[0,1] → Color`

- Mathematica's `ColorData["scheme"]` — a function from `[0,1]` to color. Pick a scheme, call it with a number, get a color.
- We need this. A color scheme is just a function: `scheme(0.5) → some color`.
- The killer combo: **easing × color scheme**
  - `progress` (from interval, time, whatever) → `easing(progress)` → `scheme(easedValue)` → color
  - Easing shapes the timing, color scheme shapes the look
  - `scheme(easeOutCubic(progress))` — that's it, that's the whole thing
- Already have `Color.palette` but it's discrete (indexed colors). Need continuous `[0,1] → Color` functions.
- Standard schemes to ship: Viridis, Inferno, Plasma, Magma, Rainbow, SunsetColors, etc.
- Custom schemes? User defines control points, we interpolate? Or just ship the good ones.

---

## Frame State — Making draw() Stateful

Currently `draw(ctx, t, W, H)` is pure — each frame is a fresh function of `t`. No frame-to-frame memory. This locks out particle trails, physics sims, accumulators, anything that builds on previous state.

### Approaches

**A. State bag** — `draw(ctx, t, W, H, state)` where `state` is a persistent plain object. User reads/writes freely. Dead simple, max flexibility. Open question: does state reset on recompile or carry over?

**B. init + draw** — User writes two functions: `init()` returns starting state, `draw(ctx, t, W, H, state)` evolves it. Recompile runs `init()` again. Cleaner contract, heavier syntax.

**C. Closure state** — User-code scope persists across frames. Variables declared at top level survive. Compiled function runs once to set up, returns a draw function. Feels natural. Hot-swap story: new code = new closure = fresh state. "Edit resets state" — arguably the right behavior for live coding.

**D. Previous frame as input** — Pass last frame as `ImageData` or offscreen canvas. Enables trails/feedback effects without explicit state. Narrow but very visual payoff.

**E. No-clear mode** — Just stop clearing the canvas between frames. Instant trails/accumulation. No API change at all. Limited — you can only add, never selectively update.

These aren't mutually exclusive. E is almost free. A or C could layer on top. D is orthogonal.

### Closure state hot-swap (not actually tricky)

Initially thought closure state makes hot-swap hard. On reflection: recompile runs the outer scope again, so closure variables reset. That's fine — you lose accumulated state on edit, get a clean slate with new logic. The only issue is if you want state to *survive* a recompile (then you need to externalize it, option A). For most live-coding cases, "edit resets state" is the natural mental model.

---

## Bar/Beat Counters and Cue-Relative Time

Pure time-derived variables — no state needed, just math on `t`.

**Bar counter (`$bar`)** — integer, `floor((t - firstBeat) / barDuration)`. If 10 bars have passed, `$bar` is 10. Alternating visuals per bar = `$bar % 2`.

**Beat counter (`$beat`)** — same idea, finer grain.

**Bars/beats since a cue point** — `$barsSinceCue = $bar - lastCueBar`. Pure if cue points are known ahead of time (from the timeline).

These fit cleanly into the current stateless model — derived values injected alongside `t`. No frame-to-frame memory needed. Separate feature from frame state.

**Key insight:** bar/beat counters and cue-relative time are NOT about state — they're about richer time-derived variables. A different axis from the frame state question above.

---

## `$$` Prefix — Stateful Variables

`$` means "reactive, external, time-derived" — `$bar`, `$beat`, `$kick.s`, `$p1.x`. Injected by the system, read-only from user code's perspective.

Stateful variables are different: **owned by user code**, persist across frames, mutated by the draw function. Need a distinct prefix.

**Candidates considered:**
- `$$` — double-dollar = "this sticks around." Stays in `$`-family, visually distinct, easy to type.
- `@` — fresh symbol, not used in JS. Would need compiler sugar to rewrite. Looks clean.
- `$_` — underscore = "private." A bit ugly.
- `_` alone — too overloaded (JS convention for throwaway/unused).
- No prefix (bare closure vars) — works structurally but no visual signal of what persists vs resets.

**Going with `$$` for now.** Compiler sugar is OK — `$$particles` can be rewritten by the preprocessor into whatever backing storage is needed (closure var, state bag slot, etc.).

```js
$$particles = $$particles || []
$$particles.push({x: rand() * W, y: rand() * H})

// cull old ones
if ($$particles.length > 500) $$particles.shift()

render(
  ...$$particles.map(p => circle(p.x, p.y, 3))
)
```

**Design decisions:**
- `$$` vars **persist across recompiles** (externalized state, not closure). Edit your draw code, `$$particles` keeps its data.
- **No declaration needed** — just use `$$foo` and it exists. Implicit init. Compiler rewrites to a backing store (e.g. `__state__["foo"]`).
- **Scope TBD** — per-sketch or global? Don't worry about it yet. Per-sketch feels right but can decide later.
- **Implementation cost is near-zero.** One object property lookup per access. The compiler sugar is a simple rewrite pass.

**Clearing `$$` state — two levels:**
- **`clear($$foo)`** — reset a single variable. Safe, surgical. "I want to restart this particle system."
- **`clearAll()` / wipe everything** — nuke all `$$` state. Dangerous — you lose everything. Needs confirmation or a keyboard shortcut you have to mean (not something you fat-finger).

Both are needed. The selective clear is the everyday tool. The full wipe is the emergency button.

**The `$`-prefix family so far:**
- `$foo` — reactive, external, read-only (time, beats, intervals, UI controls)
- `$$foo` — stateful, user-owned, read-write, persists across frames and edits

