# TODO — Live Canvas Playground

Sorted by importance. Check off as completed.

## P0 — Foundation (done)
- [x] pnpm + Vite scaffold
- [x] Engine (rAF loop, global time, draw-swap)
- [x] Compiler (eval user code → draw function, declarative auto-render)
- [x] CodeMirror 6 editor (one-dark theme, JS mode)
- [x] Stdlib: shapes, directives, math, noise, Color class
- [x] Declarative scene renderer (Mathematica-style: flat/nested arrays, Color as directive)
- [x] Auto-run toggle (debounced keystroke vs Ctrl-S)
- [x] Demo sketches (6 demos)

## P1 — Core experience
- [ ] `val()` inline sliders — CodeMirror decoration widgets that detect `val(current, min, max)` patterns in source, overlay a slider, and edit the source text on drag. The code is always source-of-truth.
- [ ] Color picker on color literals — detect `Color.hsl(...)`, `Color.hex('...')`, `'#rrggbb'` in source, overlay a color picker widget that edits the source.
- [ ] Error highlighting — underline the offending line in the editor on syntax/runtime errors.
- [ ] Better stdlib grammar — chainable shape builders? `circle(x,y,r).fill('#f00').stroke('#fff', 2)` returning a self-contained drawable. Needs design thought.

## P2 — Polish
- [ ] Keyboard shortcuts panel (help overlay)
- [ ] Play/pause/reset time controls
- [ ] FPS counter
- [ ] Canvas screenshot/export (Ctrl-Shift-S → download PNG)
- [ ] Resizable split pane (drag the divider)
- [ ] Full-screen canvas mode (F11 or button)
- [ ] Persist user code in localStorage
- [ ] Multiple tabs/files

## P3 — Extended stdlib
- [ ] More Mathematica colormaps (Viridis, Inferno, Plasma — proper LUT, not approximations)
- [ ] Perlin/Simplex noise (proper implementation, not hash-based)
- [ ] Transform stack: `translate(x,y)`, `rotate(a)`, `scale(s)` as scene directives
- [ ] `grid(nx, ny, fn)` helper — calls fn(x, y, i) and collects results into scene
- [ ] `repeat(n, fn)` helper
- [ ] Tween/animation helpers (timeline, keyframes)
- [ ] 3D projection helpers (iso, perspective) as stdlib, not just in demos
- [ ] WebGL/shader mode (optional second renderer)

## P4 — UI/UX
- [ ] White/light background option for index.html shell
- [ ] Custom CodeMirror theme (match overall aesthetic)
- [ ] Mobile-friendly layout (stack vertically)
- [ ] Drag-and-drop image loading (as texture for user code)
- [ ] Console/log panel (capture console.log from user code)

## P5 — Advanced hot-reload
- [ ] Stateful hot-reload — preserve user-defined state across code swaps (the hard problem). Approach: user declares state with `state({key: defaultValue})`, host persists it.
- [ ] Diff-based recompile — only re-eval changed code (requires AST diffing)
- [ ] MIDI/OSC input mapping for live performance
- [ ] Audio-reactive mode (FFT input as stdlib variable)

## Design Principles
> Readable flow > structural simplicity > reusability > abstraction

## Setup
```bash
pnpm install
pnpm dev        # → http://localhost:5173
pnpm build      # → dist/
```
