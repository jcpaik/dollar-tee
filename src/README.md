# src/

Entry point: `core/main.js` (loaded by `index.html` as ES module).

## Directory Layout

```
core/       engine, compilation, rendering, stdlib, persistence
audio/      playback, beat timing, timeline visualization
editor/     CodeMirror 6, inline widgets (color picker, val slider)
lib/        standalone math/utility libraries (no app dependencies)
style.css   layout & dark theme
```

## Data Flow

```
User types code
    |
editor.onChange
    |
debounce 300ms (auto-run) or Ctrl-S
    |
compile(code, stdlib, state, p5)
    |-- transformProbe()      probe(x) -> probe('x', x)
    |-- transformState()      $$foo -> __state__["foo"]
    |-- wrap with render()
    |-- new Function(ctx, __renderScene__, __state__, p, ...stdlibKeys, body)
    |
engine.setDraw(newDrawFn)     pointer swap, loop never stops
```

Slider and color picker changes bypass the debounce.

## Animation Loop (engine.js)

```
requestAnimationFrame
    |-- onPreTick(t)          update beat/loop intervals
    |-- updateReactiveState   refresh $t, $width, $height, $mouseX, $mouseY
    |-- drawFn(ctx)           user code runs
    |     returns Array? -> renderScene(ctx, shapes)
    |-- onTick(t)             update time display, timeline
    |-- catch -> onError      error bar
```

## Two Rendering Modes

**Declarative** -- return shapes/directives via `render()`:
```js
render(Bg('#111'), Fill(Color.hsl($t * 30, 70, 50)), Circle($width/2, $height/2, 100))
```

**Imperative** -- draw on `ctx` or `p` directly:
```js
ctx.fillStyle = '#111';
ctx.fillRect(0, 0, $width, $height);
```

Both can be mixed in a single sketch.

## Key Design Decisions

- The animation loop lives in the host, not in user code. User code is a factory producing a `draw(ctx)` function.
- Global time never resets on recompile.
- `$$varName` compiles to `__state__["varName"]` -- persistent state that survives recompiles.
- Audio time can override the default `performance.now` clock via `engine.setTimeSource()`.

See each subdirectory's README for per-module details.
