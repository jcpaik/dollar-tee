# core/

Engine, compilation, rendering, stdlib, and app wiring.

## Files

### main.js

Entry point. Wires all subsystems and boots with the first demo.

- Creates p5 instance, engine, audio, timeline, editor, demo selector
- `run()` -- compile + swap draw function + clear error bar
- `save()` -- save current sketch to localStorage
- `resize()` -- resize canvas to fill pane
- Registers engine callbacks: `onPreTick`, `onTick`, `onError`
- Keyboard: Ctrl/Cmd+Enter (run), Ctrl/Cmd+S (save)
- Auto-run: recompile on editor change with 300ms debounce

### engine.js

`createEngine(canvas, p5Instance)` -- owns the `requestAnimationFrame` loop and global time.

**Public API:**
- `start()`, `stop()` -- control the loop
- `getTime()` -- current elapsed time
- `getCtx()`, `getP5()`, `getState()` -- accessors
- `getDrawMs()`, `getFrameGapMs()` -- performance metrics
- `setDraw(fn)` -- swap the draw function (pointer swap, loop never stops)
- `setTimeSource(fn)` -- override time source (e.g. `() => audio.time`)
- `clearState(key)`, `clearAll()` -- reset persistent `$$` state
- `onTick`, `onError`, `onPreTick` -- settable callback properties

The loop calls `onPreTick(t)` -> `updateReactiveState()` -> `drawFn(ctx)` -> `onTick(t)`, with error catching.

### compiler.js

`compile(code, stdlib, state, p5Instance)` -- transforms user code and wraps it in `new Function()`.

**Transform pipeline:**
1. `transformProbe(code)` -- `probe(expr)` -> `probe('expr', expr)` (auto-label)
2. `transformState(code)` -- `$$foo` -> `__state__["foo"]` (persistent state)
3. Inject `render()` as `(...items) => __renderScene__(ctx, items)`
4. Wrap in `new Function('ctx', '__renderScene__', '__state__', 'p', ...stdlibKeys, body)`

Returns a draw function. If user code returns an array, it falls back to `renderScene()`.

### renderer.js

`renderScene(ctx, items, state)` -- walks declarative scene arrays recursively.

- **Color objects** -> set current fill
- **Directive objects** (`{ _dir: true }`) -> apply style (`bg`, `translate`, `rotate`, `scale`, `fill`, `stroke`, `lineWidth`, `blendMode`, `textAlign`, etc.)
- **Shape objects** (`{ type: 'circle' }`) -> draw via p5 (primary) or Canvas 2D fallback
- **Nested arrays** -> `save()`/`restore()` scoped style groups

`setRendererP5(p)` -- set the p5 instance for drawing.

**Default state:** fill=`#ffffff`, stroke=null, lineWidth=1, globalAlpha=1.

**Shapes:** circle, rect, line, ellipse, arc, polygon, shape, bezierShape, bezier, quadCurve, image, text.

### stdlib.js

`stdlib` -- object containing every name available in user code. All names are injected as local variables during compilation.

`updateReactiveState(t, W, H, p)` -- called each frame to refresh reactive getters.
`setP5(p)` -- set p5 instance for stdlib.

**Categories:**

| Category | Names |
|----------|-------|
| Reactive globals | `$t`, `$width`, `$height`, `$mouseX`, `$mouseY` |
| Shapes | Circle, Line, Rect, Polygon, Ngon, Arc, Ellipse, Text, Shape, BezierShape, Bezier, QuadCurve, Image |
| Directives | Fill, Stroke, LineWidth, NoFill, NoStroke, Bg, Font, Alpha, Translate, Rotate, Scale, StrokeCap, StrokeJoin, BlendMode, RectMode, EllipseMode, TextSize, TextAlign, TextFont, TextStyle, Tint, NoTint, Filter |
| Color | Color class (rgb/hsl/hex, palette, auto, viridis, rainbow, mix, lighten, darken) |
| Math | If, lerp, clamp, map, ease, noise, noise2, sin, cos, tan, abs, sqrt, pow, floor, ceil, round, min, max, random, atan2, log, exp |
| Constants | PI, TWO_PI, HALF_PI |
| Easings | 33 Penner easings + cubicBezier, spring |
| Intervals | `$loop`, `$beat`, `$beats`, `$beat1`-`$beat8`, tween |
| Vectors/Complex | vec2, complex |
| Helpers | val, make3D, draw, table, subdivide, probe |

### p5init.js

`createP5(container)` -- returns `Promise<p5>`. Creates a p5 instance in instance mode with `noLoop()` (dollar-tee owns the animation loop). Sets canvas id to `'canvas'`.

### probe.js

`probe(label, value, hz = 3)` -- rate-limited value inspector. Returns `value` (pass-through for inline use). Logs to console and displays on a HUD panel in `#editor-pane`.

`probe.clear()` -- wipe all entries and the HUD panel.

### demos.js

`DEMOS` -- object mapping names to code strings. 12 built-in demos:
Blank Canvas, Pulsing Circles, Easing Gallery, Bouncing Dots, Dot Grid, 3D Box Grid, Spinning Polygons, Color Field, Line Wave, Bouncing Beats, Palette Demo, Transform Demo.

### demo-selector.js

`createDemoSelector(selectEl, demos, listSketches)` -- populates a `<select>` with demo names and saved user sketches.

- `rebuild(currentKey)` -- repopulate dropdown
- `select(val)` -- set current value
- `onChange(cb)` -- register change handler

### sketch-store.js

localStorage-based sketch persistence. Prefix: `dt-sketch:`.

- `listSketches()` -> array of names
- `saveSketch(name, code)` -> void
- `loadSketch(name)` -> code string or null
- `deleteSketch(name)` -> void

### transport-ui.js

`setupTransport({ audio, engine, timeline, onResize })` -- wires audio controls and timeline UI.

- Music toggle (mute/unmute; right-click to load file)
- Play/pause button (seeks to `FIRST_BEAT` if time < `FIRST_BEAT`)
- Snap toggle for cue markers
- Draggable sash (vertical resize, double-click to collapse)
- Pre-loads `/resources/music.mp3` on startup
- Sets `engine.setTimeSource(() => audio.time)` after audio loads
