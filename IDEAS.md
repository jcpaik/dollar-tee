# IDEAS — Raw Idea Dump, Sorted

## 1. Cell-Based Code Editor

The code is **one file**, executes top-to-bottom, but the editor breaks it into
**named sections** (cells) using `///` delimiters:

```
/// array
const grid = make3D(8, 8, 4, (x,y,z) => ...);

/// projection
const boxes = project(grid, isoX, isoY);

/// shader
for (const b of boxes) { ... }
```

**UI**: A sidebar/menu lists cell names vertically. Click a name to jump to (or
focus) that cell. The editor shows one cell at a time or all cells stacked —
your choice via toggle.

**Semantics**: Cells are purely a UI concept. The runtime concatenates all cells
in order and evals as a single block. No scope isolation between cells.

**Open questions**:
- How to merge two adjacent cells? Maybe: delete the `///` line → cells merge.
- Can cells be reordered via drag? If so, the source file reorders too.
- Should selecting a cell also select which canvas/output it targets? (see §3)

---

## 2. Timeline UI and Intervals

### Timeline UI — FL Studio for Visuals

Use case: load a house track with known BPM and downbeat. Feed the system
BPM and start info (no beat detection for now).

**The loop:**
- Set a loop length (e.g., 4 bars at 120 BPM = 8 seconds)
- Timeline is a horizontal strip that loops forever in sync with the music
- Time cursor sweeps across, wraps at the loop boundary
- Press "play" and it just goes

**Drawing on the timeline:**
- Draw intervals on it — kicks, builds, decays, whatever
- Colored blocks, lanes/rows, like FL Studio's piano roll
- Name the intervals with `$` prefix: `$kick`, `$build`, `$drop`, etc.

### Interval Model — `$name.s`, `$name.e`, `$name.len`

Intervals are named variables exposed to user code. Each interval gives:
- `$kick.s` — start time (seconds, absolute)
- `$kick.e` — end time (seconds, absolute)
- `$kick.len` — duration (convenience, = `.e - .s`)

No magic envelopes, no callbacks. You build everything with plain math:
```js
const progress = ($t - $kick.s) / $kick.len;
const eased = progress * progress;
const active = $t >= $kick.s && $t < $kick.e;
```

The timeline UI is just a visual way to set start/end times instead of
typing numbers. Code is source of truth.

**Design decisions:**
- All intervals repeat with the loop. No one-shot intervals (for now).
- Units are seconds, absolute time.
- Naming: anything starting with `$`.

---

## 3. Callbacks and Events (Future)

- **On each kick**: trigger a callback (requires audio input / beat detection).
- **On cue point**: trigger a visual transition.
- Event-driven rendering alongside the continuous `draw(t)` loop.
- Example: `onBeat(() => flash(Color.auto(0)))`.

---

## 4. Voice Input for Ideation?

Strong bottleneck: coherent mental picture exists, but words come out slowly
via typing. Voice-to-text for idea capture could help. Not a code feature —
a workflow note. Consider dictation tools during brainstorming sessions.

---

## 5. Editor Enhancements

### `val()` Popover Sliders

`val(current, min, max)` is a **passthrough function** — it just returns `current`.
As code, it's a no-op. It exists to invoke editor UI.

Click on a `val(...)` expression → a **popover** (floating tooltip widget) appears
below it with a slider. Drag the slider → the first argument in source updates live.
Click elsewhere → popover dismisses.

```js
const r = val(50, 0, 100);       // float slider, continuous
const n = val(8, 1, 32, 1);      // integer steps
const speed = val(0.5, 0, 1);    // float, 0 to 1
```

**Signatures:**
- `val(current, min, max)` — 3 args, always float (continuous)
- `val(current, min, max, step)` — 4 args, snaps to step size

**Implementation:** CodeMirror tooltip system — CM has built-in support for
floating widgets anchored to source positions.

### Other Editor Enhancements

- **Color picker on color literals** — detect `Color.hsl(...)`, `Color.hex('...')`,
  `'#rrggbb'` in source. Overlay a picker that edits the source.
- **Error highlighting** — underline the offending line on syntax/runtime errors.

---

## 6. Stdlib Extensions

- Better shape grammar — chainable? `circle(x,y,r).fill('#f00').stroke('#fff',2)`?
- Proper colormaps (Viridis, Inferno, Plasma — LUT-based, not approximations)
- Perlin/Simplex noise (proper implementation)
- Transform stack: `translate(x,y)`, `rotate(a)`, `scale(s)` as scene directives
- `grid(nx, ny, fn)` and `repeat(n, fn)` helpers
- Tween/animation/keyframe helpers
- 3D projection helpers (iso, perspective) as stdlib
- WebGL/shader mode (optional second renderer)

---

## 7. UI/UX

- Play/pause/reset time controls
- FPS counter
- Canvas screenshot/export (Ctrl-Shift-S → download PNG)
- Resizable split pane (drag divider)
- Full-screen canvas mode
- Persist user code in localStorage
- Multiple tabs/files
- White/light background option for shell
- Custom CodeMirror theme
- Console/log panel (capture console.log from user code)
- Keyboard shortcuts help overlay

---

## 8. Advanced Hot-Reload

- Stateful hot-reload — preserve user state across code swaps.
  User declares state with `state({key: defaultValue})`, host persists it.
- Diff-based recompile — only re-eval changed code (AST diffing)
- MIDI/OSC input mapping for live performance
- Audio-reactive mode (FFT input as stdlib variable)

---

## 9. CC Agent Skills

- Build custom Claude Code skills for this project's workflow:
  - `/dump` — append raw idea to UNHINGED.md
  - `/sort` — promote an UNHINGED idea to IDEAS.md
  - `/plan` — generate PLAN.md from NEXT_MOVES.md
  - `/next` — pick items from IDEAS into NEXT_MOVES
- Skill definitions live in the project, not global config.

---

## Summary of Priorities

| Idea | Complexity | Value | When |
|------|-----------|-------|------|
| Cell-based editor (`///`) | Medium | High — organizes code for live use | Soon |
| Multiple named timelines | Medium | High for live performance | After cells |
| Loop mode | Medium | Primary workflow | After time model |
| `val()` inline sliders | Medium | High — live control | Soon |
| Color pickers | Medium | High — visual feedback | Soon |
| Timeline UI (DAW transport) | Hard | Killer feature | After loop mode |
| Interval/loop functions | Medium | High | With timeline/loop |
| CC agent skills | Low | Workflow quality-of-life | Anytime |
| Beat/event callbacks | Hard | Amazing but needs audio | Later |
| Stateful hot-reload | Hard | The hard problem | Later |
