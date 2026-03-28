# Design Principles

- **As intuitive as possible.** Strudel nails this for sound — lpf is lpf, notes sound like notes. Dollar-tee aims for the same directness with visuals.
- **`$` = reactive value with external context.** The `$` prefix means "this value comes from outside your code — time, music, input, canvas, UI." It's the seam between the world and your sketch.
  - Time: `$t` (elapsed seconds)
  - Canvas: `$width`, `$height` (dimensions, change on resize)
  - Music/beats: `$beat`, `$loop`, `$beat1`–`$beat8`
  - Input: `$mouseX`, `$mouseY`
  - Timeline intervals: `$kick.s`, `$kick.e`
  - Canvas locators: `$p1.x`, `$p1.y`
  - Inline sliders: `val()`
  - `$$` = user-owned persistent state (read-write, survives recompile)
  - Non-`$` names are either declarative constructors (`Circle`, `Fill`) or pure utilities (`lerp`, `subdivide`). Handles like `ctx` and `p` are plain — they're tools, not reactive values.
- **Declarative over imperative.** Mathematica `Graphics[]` style — feed shapes and directives, not pencil commands.
- **Think in spaces, not variables.** The user shouldn't compute each variable by hand. They should define the *space* values live in (a [0, 1] interval, an angle range, a grid) and *map between spaces*. `subdivide` creates a space. `.map` transforms it. Easing is a map from [0,1] to [0,1]. Color schemes are maps from [0,1] to color. Chaining these maps JS-functional-style makes the data flow legible — each step is a checkpoint, not a black box. The tool should make spaces and maps between them first-class, not leave the user manually computing `(i / n) * (max - min) + min` every time.
