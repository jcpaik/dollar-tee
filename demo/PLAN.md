# Live-Coding Visual Playground — PLAN

## The Dream
A split-screen app: **code editor on the left, canvas on the right**.
Edit code → press Ctrl-S (or even just type) → the rendering updates *instantly*
while a global `time` variable keeps ticking. Like thebookofshaders.com but for
2D/3D canvas drawing, not just shaders.

## Inspiration & Prior Art
- **thebookofshaders.com**: GLSL editor + live preview. Color pickers on vec3 color
  literals. Uniforms like `u_time` persist across edits.
- **Strudel (strudel.cc)**: Live-coding music. Uses `eval()` on the user code each
  cycle. The transport (clock) never stops — only the pattern definition gets
  swapped. Key insight: **separate the clock/state from the user code**.
- **p5.js web editor**: Has a "play" button but no true hot-reload mid-animation.
- **Hydra (hydra.ojack.xyz)**: Live-coding visuals. Eval on Ctrl-Enter. Global
  time keeps running.

## Key Insight (How Strudel/Hydra Do It)
The trick is simple in principle:

1. **The animation loop lives in the *host*, not in user code.**
   `requestAnimationFrame` runs forever in the host. It calls a `userDraw(t)` fn.
2. **User code is just a *factory* that produces a new `draw` function.**
   On each edit, we `eval()` / `new Function()` the user code to get a fresh
   `draw(ctx, t, w, h)` callback. We swap the pointer. The loop never stops.
3. **Global time is owned by the host.** User code receives `t` as a parameter.
   Edits don't reset the clock.

That's it. The "hard" version (incremental, keeping state across reloads) is
much harder, but this swap-the-draw-function approach is the **MVP**.

## Architecture (Minimal — v0)

```
┌─────────────────────────────────────────────────┐
│  index.html                                     │
│  ┌──────────────────┐  ┌──────────────────────┐ │
│  │  <textarea> or   │  │  <canvas>            │ │
│  │  CodeMirror      │  │                      │ │
│  │                  │  │  host runs rAF loop  │ │
│  │  user writes     │  │  calls userDraw(ctx, │ │
│  │  draw(ctx,t,w,h) │  │    t, w, h)          │ │
│  │                  │  │                      │ │
│  └──────────────────┘  └──────────────────────┘ │
│         Ctrl-S → eval() → swap userDraw         │
└─────────────────────────────────────────────────┘
```

**No build step. No bundler. Single HTML file to start.**

## v0 Scope (What to Build Now)

### Host responsibilities
- Own the `<canvas>` and the `requestAnimationFrame` loop
- Maintain `startTime`, compute `t = (now - startTime) / 1000`
- On Ctrl-S (or on-type with debounce): eval user code, swap `userDraw`
- Provide a small standard library the user code can call:
  - `line(ctx, x1, y1, x2, y2)`
  - `circle(ctx, x, y, r)`
  - `rect(ctx, x, y, w, h)`
  - `polygon(ctx, points)`
  - `setColor(ctx, r, g, b, a)`
  - `clear(ctx, color)`
  - `ease(t)` — smoothstep or sine easing
  - `lerp(a, b, t)`
  - `map(value, inMin, inMax, outMin, outMax)`

### User code contract
User writes a function body that receives `(ctx, t, W, H, lib)`:
```js
// Example: pulsing circle
const { circle, clear, ease, lerp } = lib;
clear(ctx, '#111');
const r = lerp(50, 200, ease(Math.sin(t) * 0.5 + 0.5));
circle(ctx, W/2, H/2, r);
ctx.fillStyle = 'hsl(' + (t * 60 % 360) + ', 80%, 60%)';
ctx.fill();
```

### Demo sketches to ship with
1. **Pulsing circle** — easing + time → radius
2. **Grid of boxes from 3D array** — fill a 3D array, render as colored boxes
3. **Rotating polygon** — time drives rotation angle
4. **Color gradient** — pixel-level or rect-level color mixing

### What we skip for now
- Color picker UI on literals (future: parse AST, overlay pickers)
- Incremental/stateful hot-reload (future: keep user state across swaps)
- CodeMirror (start with `<textarea>`, upgrade later)
- Multi-file support
- Sound/audio integration

## Recompile Strategy
For v0: **full recompile on every save.** This means:
- `new Function('ctx', 't', 'W', 'H', 'lib', userCode)`
- Wrap in try/catch — if syntax error, keep the old draw function, show error
- No state preservation across edits (user loses any variables)

This is fine for pure-functional drawing (output = f(t)) which is the 80% case.

## File Structure (v0 — single file is fine)
```
index.html    — everything: editor, canvas, host loop, stdlib
PLAN.md       — this file
```

## Next Steps
1. ✅ Write this plan
2. Build `index.html` with:
   - Split layout (flexbox)
   - `<textarea>` on left, `<canvas>` on right
   - Host animation loop
   - stdlib functions
   - Ctrl-S eval + swap
   - Error display overlay
   - 4 demo sketches (dropdown to switch)
3. Test it, iterate
4. Later: CodeMirror, color pickers, stateful reload

## Open Questions
- Should we use p5.js under the hood or raw Canvas 2D API?
  **Decision: raw Canvas 2D.** Simpler, no dependency, we control the loop.
  p5.js's `setup()/draw()` model fights against our "swap the draw fn" approach.
- WebGL/3D later? Could add a Three.js mode, but start 2D.
