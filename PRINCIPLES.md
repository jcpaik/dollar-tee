# Design Principles

- **As intuitive as possible.** Strudel nails this for sound — lpf is lpf, notes sound like notes. Dollar-tee aims for the same directness with visuals.
- **`$` = value controlled by UI, not by code.** The `$` prefix is the seam between visual control and code. All UI-to-code bindings use it:
  - Timeline intervals: `$kick.s`, `$kick.e`
  - Canvas locators: `$p1.x`, `$p1.y`
  - Inline sliders: `val()`
  - Code is always source of truth. UI surfaces set values, code consumes them.
- **Declarative over imperative.** Mathematica `Graphics[]` style — feed shapes and directives, not pencil commands.
- **Think in spaces, not variables.** The user shouldn't compute each variable by hand. They should define the *space* values live in (a [0, 1] interval, an angle range, a grid) and *map between spaces*. `subdivide` creates a space. `.map` transforms it. Easing is a map from [0,1] to [0,1]. Color schemes are maps from [0,1] to color. Chaining these maps JS-functional-style makes the data flow legible — each step is a checkpoint, not a black box. The tool should make spaces and maps between them first-class, not leave the user manually computing `(i / n) * (max - min) + min` every time.
