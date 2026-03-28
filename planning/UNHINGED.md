# UNHINGED — Raw Idea Bucket

Append only. No structure required. Fragments OK. Don't self-censor.

---

## Strudel / Integration Notes

- dollar-tee = **live DJing but with visuals**
- Strudel handles sound, dollar-tee handles the visual layer
- Goal: connect dollar-tee to Strudel someday (right now it's prototype stage)
- Strudel isn't technically hard (pattern algebra + Web Audio API + mini-notation parser) — so integration is feasible

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

## Underscore Auto-Destructure — Probably Won't Do This

`_ =>` as a magic parameter that auto-destructures based on free variable analysis.

```js
const a = 3
// instead of:
items.map(({x, z}) => x + z + a)
// write:
items.map(_ => x + z + a)
```

Compiler sees `x`, `z` are free (not in scope), `a` is captured (`const a = 3` above). Rewrites to `({x, z}) => x + z + a`.

**"In scope" means:** stdlib names (known statically), `$`/`$$` variables (known by prefix), user declarations preceding the lambda (needs a variable collector pass).

Would work for `table()`, `.map()`, any callback. Build once in the compiler, works everywhere.

**Why probably not:** requires a lightweight scope analysis pass — scanning for `const/let/var` declarations above the lambda. Not a full AST parse but more than a regex. Fragile edges around shadowing, nested blocks, same name reused. Fine for simple sketches, landmine for anything complex. Likely not worth the magic.

---

## p5.js as Rendering Backend

### The want

Not "run p5 sketches in dollar-tee." The real desire: access p5's deep functionality — masking, blend modes, filters, `beginShape()`/`vertex()`/`bezierVertex()`, offscreen buffers (`createGraphics`), pixel manipulation, `image()`, `tint()` — without reimplementing them all by hand in the stdlib. But keep dollar-tee's declarative `render()` identity.

### The idea: p5 as backend, dollar-tee as interface

Use p5.js in instance mode as the rendering engine underneath `drawShape()` and `renderScene()`. Dollar-tee's API stays the same. User writes `render(fill('red'), circle(200, 200, 40))` — internally that calls `p.fill(...)`, `p.circle(...)`. The user never sees p5 unless they want to.

Escape hatch is free: since p5 is already loaded, expose `p` (the p5 instance) in user code. Drop into imperative `p.blendMode(ADD)` when the declarative layer doesn't cover something yet. Gradually promote useful bits into declarative stdlib.

### Gains

- All of p5's drawing features for free (masks, blend modes, filters, vertex shapes, offscreen buffers, pixel ops)
- p5 2.0 shipped April 2025 — WebGL shaders in JS, variable fonts, OKLCH. Get those without writing them
- Escape hatch to imperative p5 when needed, declarative by default

### Friction points

**Coordinate/argument mismatches.** Dollar-tee uses radius, p5 uses diameter. `circle(x,y,r)` vs `p.circle(x,y,d)`. Same for `ellipse`, `arc`. `drawShape()` needs a translation layer (multiply/divide by 2). Maintainable but annoying.

**Canvas ownership.** p5 instance mode creates its own canvas. Engine needs to use p5's canvas instead of creating one. p5 supports `new p5(sketch, container)` — workable but changes the init flow.

**Dual state stacks.** Dollar-tee's declarative renderer tracks state (`fill`, `stroke`, etc.) in its own object. p5 also tracks state internally. Need to sync: at each `drawShape()`, push p5 state, apply dollar-tee's state, draw, pop. Otherwise state leaks.

**Dependency weight.** p5.js is ~1MB minified. Currently zero runtime deps. Changes the project character from "I control everything" to "standing on p5's shoulders."

**Performance.** Probably negligible — p5 instance mode is a thin wrapper over Canvas2D. One extra function call per draw op. Noise in the frame budget for 2D work.

### Open question

Do we need p5 now, or is this future insurance? Many p5 features are just nicer names for Canvas2D primitives we already have access to (`globalCompositeOperation` = blend modes, `clip()` = masking, `filter` = CSS filters). Could cherry-pick instead of taking the whole dependency.

### Capitalized names solve the collision

Influenced by Mathematica: **capitalize the declarative API**.

- `Circle(x, y, r)` → returns descriptor (dollar-tee's declarative identity)
- `circle(x, y, d)` → p5 imperative, draws immediately

Same for `Rect`/`rect`, `Fill`/`fill`, `Stroke`/`stroke`, `Line`/`line`, `Text`/`text`, etc.

**Zero collision.** Different case, different paradigm, both available in the same sketch. No translation layer for arguments — `Circle` uses dollar-tee's conventions (radius), `circle` uses p5's (diameter). Each API owns its own semantics.

**Pitch to p5 users:** "Your code already works. When you want declarative composition, capitalize." One-word migration path.

**Pitch to dollar-tee users:** `render(Fill('red'), Circle(200, 200, 40))` — Mathematica-flavored, visually distinct from imperative code. You can mix both styles in one sketch.

---

## Locators — Canvas Overlay GUI Components

The right pane (rendered canvas) is currently display-only. Want: **interactive GUI elements layered on top of it**. Not drawn by p5 — drawn on a separate overlay so they don't interfere with the art. The user's sketch renders below; locators float above.

### What are locators?

Anything interactive that lives on the canvas surface but isn't part of the artwork:

- **Draggable points** (Mathematica `Locator[]` style) — place a point, drag it, read its position in code as a vec2. Already sketched above in "Draggable Cue Points" but this is bigger.
- **XY coordinate rulers / axes** — pixel rulers along the edges. Shows where you are. Maybe snap-to-grid.
- **Bounding box handles** — drag corners/edges to define a rectangular region. Code reads it as `$box.x, $box.y, $box.w, $box.h`.
- **Angle dial** — radial control for rotation values. Drag around a circle to set an angle.
- **Path editor** — place control points, get a Bezier/polyline in code.
- **Grid overlay** — visual reference grid, toggleable, doesn't render into the artwork.
- **Measurement tool** — click two points, see the distance. Useful for laying things out.
- **Color picker eyedropper** — click on canvas, get the color at that pixel.

### Architecture question: where do they live?

**Option A — HTML overlay.** A transparent `<div>` or `<svg>` positioned exactly over the p5 canvas. Locator handles are DOM elements (or SVG circles/rects). Canvas renders underneath, locators float on top. Mouse events hit the overlay first; pass through when not on a handle.

- Pro: DOM handles get focus/hover/cursor for free. No interference with p5 rendering.
- Pro: CSS transforms match canvas transforms easily.
- Con: Two coordinate systems to keep in sync (DOM pixels vs canvas pixels, especially on retina / resize).
- Con: Many locators = many DOM nodes. Probably fine for <100.

**Option B — Separate canvas overlay.** A second `<canvas>` stacked on top of the p5 canvas. Locators drawn with Canvas2D. Custom hit-testing.

- Pro: Pixel-perfect alignment, same coordinate system.
- Pro: Can draw anything (guides, grids, measurement lines) without DOM overhead.
- Con: Must implement own hit-testing, hover states, cursor changes.
- Con: Redraws needed when locators move.

**Option C — Draw locators inside p5, after the user's scene.** After `renderScene()`, draw locator handles using p5. Simple — no extra layers.

- Pro: Zero extra infrastructure.
- Con: Locators mix into the artwork if user screenshots/exports. They ARE part of the frame.
- Con: Locators affected by user transforms (rotate, scale). Confusing.
- Con: Can't overlay on top of blend modes / filters without getting composited in.

**Gut feeling:** Option A (HTML/SVG overlay) for handle-type locators, Option B (canvas overlay) for guides/rulers/grids. Could be one overlay canvas + a few DOM elements for the interactive bits.

### How locators wire to code

Same `$` pattern as everything else:

```js
// Place a Locator named $p1 at initial position (200, 200)
// User drags it around on the canvas

render(
  Circle($p1, 50),            // vec2 position from locator
  Line($p1, $p2),             // line between two locators
  Text(`${$p1}`, $p1.add(vec2(10, -10))),  // label showing coords
)
```

Locators are vec2 values. `$p1.x`, `$p1.y` work naturally. Arithmetic works: `$p1.add($p2).scale(0.5)` = midpoint. `$p1.dist($p2)` = distance.

### How are locators created?

Open question — several models:

**A. Code-declared.** User writes `Locator('$p1', vec2(200, 200))` in their code. The system detects it, creates the handle on the overlay. Dragging updates the position. Like `val()` — code declares, UI manifests.

**B. UI-placed.** Right-click canvas → "Add locator." Name it, it appears. Code can reference `$p1` immediately. More visual but disconnected from code.

**C. Hybrid.** Code declares locators with initial positions. If they don't exist yet, they're created. If they already exist (from a previous drag), the saved position overrides the code default. Like `val(50, 0, 100)` — code sets the default, UI overrides.

Hybrid (C) is the most `val()`-consistent. Code is source of truth for what locators exist and their defaults; UI overrides the current value.

### Locator types beyond points

- **LocatorLine($name, $p1, $p2)** — constrained to a line segment, returns a scalar (0→1 progress along the line).
- **LocatorRect($name, pos, size)** — drag corners to resize. Returns `{x, y, w, h}`.
- **LocatorAngle($name, center, initial)** — drag around a circle. Returns radians.
- **LocatorPath($name, points)** — editable polyline/bezier. Returns array of vec2.

### Rulers and guides (non-interactive overlay)

Not wired to `$` variables — purely visual aids:

- **Pixel rulers** — along top and left edges, like Photoshop. Show coordinates as you move the mouse.
- **Grid** — toggleable, adjustable spacing. Drawn on overlay, doesn't enter the artwork.
- **Crosshair at mouse** — subtle lines showing exact mouse position. Coordinate readout.
- **Origin marker** — shows where (0,0) is, especially after transforms.
- **Safe area / margin guides** — for layout.

All of these are toggled via a toolbar button or keyboard shortcut, not via code.

### Connection to existing `$mouse`

`$mouse` is already a reactive vec2. Locators are the same concept but user-placed and persistent. `$mouse` is the "built-in locator that follows your cursor." Custom locators are "mouse positions you pinned down."

### Connection to `val()` sliders

`val()` = 1D locator in the editor. Canvas locators = 2D locators on the canvas. Same mental model: code declares, UI provides the control surface, value flows back into code.

**Emerging pattern:**
- `val(50, 0, 100)` — 1D, in-editor, scalar
- `Locator($name, pos)` — 2D, on-canvas, vec2
- Timeline intervals — 1D, on-timeline, time range
- All are "$-wired UI controls"
