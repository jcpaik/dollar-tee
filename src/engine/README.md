# Engine — Animation Loop & Hot Reload

## How It Works

### The Loop (`engine.js`)

The engine runs a `requestAnimationFrame` (rAF) loop. Each frame:

1. Get current time `t` (from wall clock or audio source)
2. Call `drawFn(ctx)`
3. Schedule next frame

The loop never stops. It's always ticking.

### requestAnimationFrame & Frame Rate

rAF is a browser API — you ask the browser to call you before the next repaint,
and the **browser decides when**. Typical rates:

- **Plugged in, active tab** → matches display refresh (60fps on 60Hz, 120fps on ProMotion)
- **macOS Low Power Mode / battery saver** → 30fps
- **Background / hidden tabs** → 1–10fps
- **GPU pressure / thermal throttling** → variable drops

There is no way to force a higher rate. If the fps counter shows 30fps but
draw time is <1ms, the cap is coming from the OS or browser, not the app.

### Relationship to p5.js

p5.js is used as a **rendering backend only**. Its own frame management is
completely bypassed:

- `p.noLoop()` is called in `p5init.js` — p5's internal `draw()` loop never runs
- `p.setup()` / `p.draw()` pattern is not used
- The engine owns `requestAnimationFrame`, timing, and frame scheduling

**What p5 provides:**
- Canvas setup (`createCanvas`, `resizeCanvas`)
- Drawing primitives (`circle`, `rect`, `line`, `ellipse`, `arc`, `text`, `image`)
- Shape composition (`beginShape` / `vertex` / `endShape`, beziers)
- Styling (`fill`, `stroke`, `strokeWeight`, `blendMode`, `tint`, `filter`)
- Transforms (`translate`, `rotate`, `scale`, `push` / `pop`)
- Mouse position (`mouseX`, `mouseY`)

**What p5 does NOT do:**
- Animation loop (engine's rAF)
- Event handling (only mouse coords are read)
- User-facing API (users write `Circle(x, y, r)` and `render(...)`, not `p.circle()`)

The stdlib builds declarative scene descriptors; the renderer translates them
into p5 draw calls. User code never touches p5 directly.

### Compilation (`compiler.js`)

User code is a string in the editor. `compile()` turns it into a callable function
using `new Function(...)` — basically runtime `eval`.

User writes:
```js
render(fill('red'), circle(W/2, H/2, 100 + 50 * sin(t)))
```

`compile()` produces (roughly):
```js
function anonymous(ctx, t, W, H, __renderScene__, fill, circle, sin, ...) {
  const render = (...items) => __renderScene__(ctx, items);
  render(fill('red'), circle(W/2, H/2, 100 + 50 * sin(t)))
}
```

All stdlib names (`fill`, `circle`, `sin`, etc.) are injected as function
parameters so user code can reference them directly.

### Hot Swap

When the user edits code and hits run (or auto-run fires after 300ms debounce):

1. `compile()` runs on the new text → produces a **new** `drawFn`
2. `engine.setDraw(newFn)` replaces the old one
3. Next frame calls the new function

The loop doesn't pause. No restart needed. Just swap which function gets called.

### Why It's Fast

`new Function()` runs **once** per edit, not per frame. After that, `drawFn` is
a regular JS function. V8 JIT-compiles it to machine code. Calling it 60x/sec
is trivial — same as any function call in any JS app.

Per-frame cost:
- Call user function (native speed after JIT)
- User function calls Canvas API (`fillRect`, `arc`, etc.)
- Canvas API talks to GPU

## Future: Closure State

Currently `drawFn` is stateless — pure function of `t`. No frame-to-frame memory.

With closure state, user code would look like:
```js
let particles = []

return (ctx, t, W, H) => {
  particles.push({x: Math.random() * W, y: Math.random() * H})
  // draw particles...
}
```

`compile()` runs the outer scope once. The returned inner function runs each
frame. `particles` lives in the outer scope — survives between frames via
closure (inner function holds a reference to the outer variable).

On recompile: outer scope runs again → `let particles = []` executes fresh →
old state garbage collected. **Edit = reset.** Falls out naturally.

## Potential Bottlenecks (Not Problems Yet)

Things to watch as the project grows:

- **Canvas 2D is CPU-bound.** Hundreds of shapes = fine. Thousands with
  blending/gradients = you'll feel it. Escape hatch: WebGL (big leap).

- **Unbounded closure state.** `particles.push(...)` every frame without
  culling = memory grows forever (60 items/sec = 3600/min). Users need a
  pattern for bounding state (ring buffer, max length, age-based eviction).

- **Declarative renderer traversal.** Walks the scene array each frame.
  Deep nesting or massive arrays (`table` with large N×M) could matter.

- **Compiler complexity.** Fast now, but adding preprocessor passes (for
  `table()` sugar, `val()` detection, `$`-variable injection) means more
  work per recompile. Probably still fine — compiles are infrequent (on edit,
  not per frame).

- **Audio analysis per frame.** FFT/waveform data as a `$`-variable means
  a decode + copy every frame.

None of these are problems today. They're the "watch this gauge" list.
