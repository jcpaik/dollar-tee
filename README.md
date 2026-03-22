# Live Canvas Playground

A live-coding visual playground for VJ-style performance. Code on the left,
canvas on the right. Edit code and see it render instantly while the clock
keeps ticking.

## Setup

```bash
pnpm install
pnpm dev          # dev server (Vite)
pnpm build        # production build → dist/
```

## How It Works

- **Auto-run** (toggle): recompiles on every keystroke (300ms debounce)
- **Ctrl-S / Cmd-S**: manual compile
- Global time `t` never stops — code swaps happen mid-animation
- Errors show in a red bar; the last working draw keeps running

## Two Rendering Modes

**Declarative** (Mathematica-style) — return an array of shapes and directives:
```js
return [
  bg('#111'),
  fill(Color.hsl(t * 30, 70, 50)),
  circle(W/2, H/2, 100),
];
```

**Imperative** — use `ctx` (Canvas2D) directly:
```js
ctx.fillStyle = '#111';
ctx.fillRect(0, 0, W, H);
```

## Available in User Code

- `ctx` — Canvas2D context
- `t` — time in seconds (never resets)
- `W`, `H` — canvas dimensions
- **Shapes**: `circle` `rect` `line` `polygon` `arc` `ellipse` `text`
- **Directives**: `fill` `stroke` `lineWidth` `noFill` `noStroke` `bg` `alpha`
- **Color**: `Color.hsl()` `.rgb()` `.hex()` `.auto(i)` `.palette` `.mix()` `.rainbow(t)`
- **Math**: `lerp` `clamp` `map` `ease` `noise` `noise2` + all `Math.*`
- **Helpers**: `val(v, min, max)` `make3D(nx,ny,nz,fn)` `draw(ctx, scene)`

## Idea-to-Code Pipeline

```
UNHINGED.md        IDEAS.md          TODO.md          PLAN.md         Code
(raw dump)    →   (sorted ideas)  →  (committed)  →   (spec)     →  (shipped)
              ↑                   ↑                ↑
          "this idea       "let's think        "let's build
           has legs"        about tradeoffs"    this now"
```

Each arrow is one Claude Code session, working with the two adjacent files.

See `WORKFLOW.md` for full details.

## Architecture

```
src/
  main.js        entry — wires editor + engine + compiler
  engine.js      rAF loop, global time, draw-fn swap
  compiler.js    new Function() eval + declarative auto-render
  editor.js      CodeMirror 6 (one-dark, JS mode)
  stdlib.js      shapes, directives, math, noise, scene renderer
  color.js       Color class (RGB/HSL/hex, Mathematica palette)
  demos.js       demo sketches
  style.css      layout
```

## Design Principles

> Readable flow > structural simplicity > reusability > abstraction
