# PLAN: p5.js Backend + Capitalized Declarative API

## Principles (guardrails)

From P5JS_COMPARISON.md and project philosophy:

- **배려 (consideration)** — dollar-tee's edge is convenience pushed to the extreme
- **Declarative `render()` is the identity** — Mathematica-style scene description
- **p5 is the engine, dollar-tee is the interface** — user doesn't see p5 unless they want to
- **Zero collision via capitalization** — `Circle` = declarative descriptor, `circle` = p5 imperative
- **p5 users get zero-friction adoption** — their code works, capitalize when you want declarative

## Capitalization rule

**Capitalized = things you put inside `render()`** (shapes and style directives):
- Shapes: `Circle`, `Rect`, `Line`, `Arc`, `Ellipse`, `Text`, `Polygon`, `Ngon`
- Directives: `Fill`, `Stroke`, `LineWidth`, `NoFill`, `NoStroke`, `Bg`, `Font`, `Alpha`

**Lowercase = everything else** (actions, utilities, math, timing):
- `render()`, `subdivide()`, `val()`, `make3D()`, `table()`, `draw()`
- `lerp`, `map`, `noise`, `clamp`, `sin`, `cos`, etc.
- `$beat`, `$loop`, `$beat1`–`$beat8`, `tween`
- `Color` — already capitalized, stays

**Open feeling:** `subdivide()` arguably belongs capitalized (Mathematica would do `Subdivide[]`). Minor — not blocking. Revisit later if it nags.

## Phase 1: Capitalize declarative API

Mechanical rename. No new dependencies. Everything still works on raw Canvas2D.

1. Rename shape constructor functions in stdlib.js
2. Rename style directive functions in stdlib.js
3. Update export object keys
4. Update compiler (render injection)
5. Update all demos
6. Update comments/docs references

## Phase 2: Add p5.js as rendering backend

1. `npm install p5`
2. Init p5 in instance mode — p5 creates the canvas, engine uses it
3. Rewire `drawShape()` to call p5 methods (`p.circle()`, `p.rect()`, etc.)
4. Argument translation in drawShape (dollar-tee radius → p5 diameter, etc.)
5. Expose `p` (p5 instance) to user code via compiler injection
6. p5's lowercase functions become available in user code automatically
7. State sync: push/pop p5 state at each `drawShape()` call to match declarative state

## Phase 3: Rename reactive globals to `$` prefix

Per PRINCIPLES.md: `$` = reactive value with external context. Currently `t`, `W`, `H` violate this — they're bare names for reactive values.

### Renames

| Current | New | Why reactive |
|---------|-----|-------------|
| `t` | `$t` | Time — changes every frame |
| `W` | `$width` | Canvas width — changes on resize, matches p5 naming |
| `H` | `$height` | Canvas height — same |

### New globals to add

| Name | Source | What it is |
|------|--------|-----------|
| `$mouseX` | `p.mouseX` | Mouse x position |
| `$mouseY` | `p.mouseY` | Mouse y position |

**Dropped:** `$frameCount` — redundant with `$t`. Same axis, different units. `$beat.n` or `Math.floor($t * 60)` covers the rare case.

### What stays un-prefixed

- `ctx` — a handle/tool, not a reactive value
- `p` — same, a handle to p5 instance
- `render()`, `subdivide()`, etc. — functions, not values

### Implementation

The tricky part: `t`, `W`, `H` are currently passed as positional args to the compiled function:
```js
new Function('ctx', 't', 'W', 'H', '__renderScene__', '__state__', 'p', ...names, wrapped)
```

Two approaches:
1. **Rename the positional args** — `new Function('ctx', '$t', '$width', '$height', ...)`. Clean but `$` in parameter names is unusual (though valid JS).
2. **Inject via stdlib** — make `$t`, `$width`, `$height` dynamic getters in the stdlib object that read from engine state each frame. Mouse would also go here. This is cleaner long-term since all `$`-prefixed values come from one place.

Approach 2 is better — it unifies all reactive values in stdlib, and the compiler doesn't need special-case positional args for them. The engine updates them each frame before calling drawFn.

### Migration

- Keep `t`, `W`, `H` as aliases during transition (or permanently — they're short and useful)
- All demos update to `$t`, `$width`, `$height`
- New demos use `$` prefix exclusively

## Decisions still needed (will surface when reached)

- **`ctx` in user code** — keep exposing alongside `p`? Some demos use `ctx` directly.
- **Timeline canvas** — keep on raw Canvas2D or move to p5?
- **Which p5 functions to auto-expose** — all of them, or a curated subset?
- **Keep `t`/`W`/`H` as aliases?** — convenience vs. principle consistency
