# Live-Coding Visual Playground — PLAN

## The Dream
A split-screen app: **code editor on the left, canvas on the right**.
Edit code → press Ctrl-S (or just type) → the rendering updates *instantly*
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
1. **The animation loop lives in the *host*, not in user code.**
   `requestAnimationFrame` runs forever in the host. It calls a `userDraw(t)` fn.
2. **User code is just a *factory* that produces a new `draw` function.**
   On each edit, we `new Function()` the user code to get a fresh draw callback.
   We swap the pointer. The loop never stops.
3. **Global time is owned by the host.** User code receives `t` as a parameter.
   Edits don't reset the clock.

## Architecture (v1 — current)

```
index.html              ← shell: two panes, loads main.js
src/
  main.js               ← entry: wires editor + engine + compiler
  engine.js             ← rAF loop, global time, draw-fn swap
  compiler.js           ← new Function() + declarative auto-render
  editor.js             ← CodeMirror 6 (one-dark, JS mode)
  stdlib.js             ← shapes, directives, math, noise, renderer
  color.js              ← Color class (RGB/HSL/hex, mix, palette)
  demos.js              ← demo sketch strings
  style.css             ← layout
```

### Data flow
```
editor.onChange → debounce → compile(code, stdlib)
                                  ↓
                            new Function(ctx, t, W, H, ...stdlibNames, code)
                                  ↓
                            engine.setDraw(fn)   ← pointer swap, loop never stops
                                  ↓
                            loop: fn(ctx, t, W, H)
                                  ↓
                            if returns Array → renderScene(ctx, array)
```

### Two rendering modes
1. **Imperative**: user draws on `ctx` directly. No return value.
2. **Declarative (Mathematica-style)**: user returns an array of shapes and
   directives. The host renderer walks it. Nested arrays = scoped groups
   (push/pop style state). Color objects in the array set the current fill.

```js
// Declarative
return [
  bg('#111'),
  fill(Color.hsl(t * 30, 70, 50)),
  circle(W/2, H/2, 100),
  [stroke('#fff'), lineWidth(2), line(0, 0, W, H)],  // scoped group
];

// Imperative
ctx.fillStyle = '#111';
ctx.fillRect(0, 0, W, H);
ctx.fillStyle = Color.hsl(t * 30, 70, 50).toCSS();
ctx.beginPath(); ctx.arc(W/2, H/2, 100, 0, Math.PI*2); ctx.fill();
```

## Stdlib surface
- **Shapes**: `circle(x,y,r)` `rect(x,y,w,h)` `line(x1,y1,x2,y2)` `polygon(pts)` `arc(x,y,r,s,e)` `ellipse(x,y,rx,ry)` `text(str,x,y,sz)`
- **Directives**: `fill(c)` `stroke(c)` `lineWidth(w)` `noFill()` `noStroke()` `bg(c)` `font(f)` `alpha(a)`
- **Color**: `Color.hsl(h,s,l)` `.rgb(r,g,b)` `.hex('#fff')` `.auto(i)` `.palette` `.mix()` `.lighten()` `.darken()` `.alpha(a)` `.rainbow(t)` `.viridis(t)`
- **Math**: `lerp` `clamp` `map` `ease` `easeIn` `easeOut` `easeInOut` `noise` `noise2` + all `Math.*` as top-level names
- **Helpers**: `val(v, min, max)` (future slider) `make3D(nx,ny,nz,fn)` `draw(ctx, scene)` (explicit render)

## Recompile strategy
Full recompile on every save/keystroke:
- `new Function('ctx', 't', 'W', 'H', ...Object.keys(stdlib), code)`
- try/catch — syntax error → keep old draw, show error bar
- No state preservation across edits (pure-functional: output = f(t))

## Decisions made
- **Raw Canvas 2D** over p5.js — simpler, no dependency, we control the loop
- **Plain JS** over TypeScript — readable flow, no compile step friction
- **CodeMirror 6** over Monaco — lighter, better for custom widgets (future sliders)
- **Both imperative and declarative modes** — user chooses per sketch
- **Mathematica-style scene arrays** — Color/directives interleaved with shapes

## What's next
See `TODO.md` for the prioritized backlog. Key upcoming work:
- `val()` inline sliders (P1)
- Color picker on color literals (P1)
- Play/pause/reset, FPS counter, screenshot export (P2)
- Transform stack, grid helpers, proper noise (P3)
