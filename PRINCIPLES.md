# Design Principles

- **As intuitive as possible.** Strudel nails this for sound — lpf is lpf, notes sound like notes. Dollar-tee aims for the same directness with visuals.
- **`$` = value controlled by UI, not by code.** The `$` prefix is the seam between visual control and code. All UI-to-code bindings use it:
  - Timeline intervals: `$kick.s`, `$kick.e`
  - Canvas locators: `$p1.x`, `$p1.y`
  - Inline sliders: `val()`
  - Code is always source of truth. UI surfaces set values, code consumes them.
- **Declarative over imperative.** Mathematica `Graphics[]` style — feed shapes and directives, not pencil commands.
