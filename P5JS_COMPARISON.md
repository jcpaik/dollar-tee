# Principles

## Core principle: 배려 (consideration for the user)

The tech is not novel. CodeMirror + Canvas2D + Web Audio — all standard. p5.js does the same drawing with a different API shape.

The real edge is **convenience pushed to the extreme**. The tool does the tedious work so the user stays in creative flow. p5.js still makes you suffer: find the right cue point yourself, convert canvas coordinates back to pixel values, wire up audio analysis, manage your own timing. Dollar-tee eliminates that friction.

We provide (or will provide):
- **Locators** — know where you are in the canvas without manual coordinate math
- **Cue points** — mark and jump to moments in the music visually
- **Musical time as first-class** — `$beat`, `$bars`, `$loop` just exist, no setup required
- **Beat grid + timeline** — see the music structure, not just hear it

The differentiator is not the tech stack. It is 배려 — thoughtfulness toward the person writing visual code. Every friction point that p5.js leaves to the user, dollar-tee should handle.

## p5.js compatibility

### What could be a p5.js library

The **intervals system** (`$beat`, `$bars`, `$loop`, `tween`) + easing functions have no equivalent in p5.js and no naming conflicts. This is the most portable, most novel piece. A `p5.beats` library that gives p5.js users musical time regions with easing would fill a real gap.

The **beat grid timeline UI** could also be a standalone web component.

### What clashes hard

The stdlib and p5.js have **massive namespace collisions**. These names exist in both:

| dollar-tee | p5.js | Conflict type |
|---|---|---|
| `circle(x,y,r)` → returns descriptor | `circle(x,y,d)` → draws immediately | Same name, opposite paradigm |
| `rect`, `line`, `arc`, `ellipse`, `text` | Same names | Same |
| `fill(color)` → returns directive | `fill(r,g,b)` → sets state immediately | Same |
| `stroke`, `noFill`, `noStroke` | Same names | Same |
| `lerp`, `map`, `noise` | Same names | Same (similar semantics though) |
| `random`, `sin`, `cos`, etc. | Same names | Same |

Beyond naming, the **paradigm is fundamentally different**:
- **p5.js is imperative**: `circle(x, y, r)` draws to canvas right now
- **dollar-tee is declarative**: `circle(x, y, r)` returns `{type: 'circle', x, y, r}`, rendered later by the scene walker

These can't coexist under the same names. You'd have to choose one:
1. **Namespace it** — `dt.circle()`, `dt.fill()` — but then you lose the clean top-level API that makes dollar-tee nice to write in
2. **Replace p5's draw model** — override p5's functions with declarative versions — but then it's not really p5.js anymore
3. **Keep them separate** — dollar-tee is its own thing, but the intervals/timing piece ships as a p5.js addon

### Loop & canvas ownership

Both p5.js and dollar-tee want to own `draw()`, the animation loop, and the canvas. p5.js uses `setup()` + `draw()` callbacks. Dollar-tee has its own engine with `setDraw()` hot-swap. Merging these means one has to yield control to the other.

### Recommendation

**Extract the timing layer as a standalone p5.js library.** The rest stays as dollar-tee's own thing. The intervals system is the most novel piece, has zero naming conflicts, and fills a genuine gap in the p5.js ecosystem. Everything else (shapes, directives, scene tree) is dollar-tee's identity — trying to force it into p5.js would dilute both.
