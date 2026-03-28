# Dollar-Tee API Reference

Dollar-tee is a live-coding visual playground powered by p5.js. It provides a declarative, Mathematica-style API where **Capitalized functions** (Circle, Fill, etc.) return descriptors that you pass to `render()`, while p5's imperative functions are available in lowercase through the `p` instance.

All names listed here are available as top-level variables in user code -- no imports needed.

---

## Reactive Values (`$` prefix)

Reactive values are updated every frame by the engine. The `$` prefix means "this value comes from outside your code -- time, music, input, canvas."

### $t

Elapsed time in seconds since the sketch started. Increases continuously.

```js
render(Circle($width/2, $height/2, 50 + 30 * sin($t)))
```

### $width

Canvas width in pixels. Updates on resize.

```js
render(Circle($width/2, $height/2, 100))
```

### $height

Canvas height in pixels. Updates on resize.

```js
render(Line(0, $height/2, $width, $height/2))
```

### $mouseX

Current mouse x position (from p5).

```js
render(Circle($mouseX, $mouseY, 20))
```

### $mouseY

Current mouse y position (from p5).

```js
render(Circle($mouseX, $mouseY, 20))
```

---

## Shapes (Capitalized -- return descriptors for render())

Shape functions return plain descriptor objects. They do nothing until passed to `render()`.

### Circle(x, y, r)

A circle centered at (x, y) with radius r.

```js
render(Fill('red'), Circle(200, 200, 50))
```

**p5 equivalent:** `fill('red'); circle(200, 200, 100)` (note: p5 uses diameter)

### Rect(x, y, w, h)

A rectangle with top-left corner at (x, y), width w, height h.

```js
render(Fill('#3388ff'), Rect(50, 50, 200, 100))
```

**p5 equivalent:** `fill('#3388ff'); rect(50, 50, 200, 100)`

### Line(x1, y1, x2, y2)

A line segment from (x1, y1) to (x2, y2).

```js
render(Stroke('white'), LineWidth(2), Line(0, 0, $width, $height))
```

**p5 equivalent:** `stroke('white'); strokeWeight(2); line(0, 0, width, height)`

### Ellipse(x, y, rx, ry)

An ellipse centered at (x, y) with x-radius rx and y-radius ry.

```js
render(Fill('purple'), Ellipse(200, 200, 80, 40))
```

**p5 equivalent:** `fill('purple'); ellipse(200, 200, 160, 80)` (note: p5 uses diameters)

### Arc(x, y, r, start, end)

A circular arc centered at (x, y) with radius r, from angle start to end (radians).

```js
render(Fill('orange'), Arc($width/2, $height/2, 100, 0, PI))
```

**p5 equivalent:** `fill('orange'); arc(width/2, height/2, 200, 200, 0, PI)` (p5 uses diameter for both axes)

### Text(str, x, y, size?)

Text at position (x, y). Default size is 16px.

```js
render(Fill('white'), Text('hello world', 100, 100, 24))
```

**p5 equivalent:** `fill('white'); textSize(24); text('hello world', 100, 100)`

### Polygon(pts)

A closed polygon from an array of [x, y] points.

```js
render(
  Fill('cyan'), NoStroke(),
  Polygon([[100,100], [200,50], [300,100], [200,200]])
)
```

**p5 equivalent:** `fill('cyan'); noStroke(); beginShape(); vertex(100,100); vertex(200,50); ... endShape(CLOSE)`

### Ngon(x, y, r, n, angle?)

A regular n-sided polygon centered at (x, y) with radius r. Optional starting angle (default 0).

```js
render(Fill('gold'), Ngon($width/2, $height/2, 80, 6, $t))
```

**p5 equivalent:** No direct equivalent -- you would compute vertices manually.

### Shape(points, close?)

An open or closed shape from an array of [x, y] points. Set close to false for an open path (default: true).

```js
render(
  Stroke('white'), NoFill(), LineWidth(2),
  Shape([[0, 100], [100, 0], [200, 100]], false)
)
```

**p5 equivalent:** `beginShape(); vertex(0,100); vertex(100,0); vertex(200,100); endShape()`

### Bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2)

A cubic bezier curve from (x1, y1) to (x2, y2) with control points (cx1, cy1) and (cx2, cy2).

```js
render(
  Stroke('lime'), NoFill(), LineWidth(2),
  Bezier(50, 200, 100, 50, 300, 50, 350, 200)
)
```

**p5 equivalent:** `noFill(); stroke('lime'); bezier(50, 200, 100, 50, 300, 50, 350, 200)`

### QuadCurve(x1, y1, cx, cy, x2, y2)

A quadratic bezier curve from (x1, y1) to (x2, y2) with control point (cx, cy).

```js
render(
  Stroke('pink'), NoFill(), LineWidth(2),
  QuadCurve(50, 200, 200, 50, 350, 200)
)
```

**p5 equivalent:** `beginShape(); vertex(50, 200); quadraticVertex(200, 50, 350, 200); endShape()`

### BezierShape(points)

A composite bezier path. First element is [x, y] (the start point), remaining elements are [cx1, cy1, cx2, cy2, x, y] (cubic bezier segments).

```js
render(
  Stroke('white'), NoFill(),
  BezierShape([
    [50, 200],
    [100, 50, 200, 50, 250, 200],
    [300, 350, 400, 350, 450, 200],
  ])
)
```

### Image(img, x, y, w?, h?)

Draw a loaded image at (x, y), optionally scaled to w x h.

```js
// img must be loaded via p5's loadImage() or similar
render(Image(img, 0, 0, $width, $height))
```

**p5 equivalent:** `image(img, 0, 0, width, height)`

---

## Style Directives (Capitalized -- go inside render())

Style directives modify the rendering state for shapes that follow them in the same scope.

### Fill(color)

Set the fill color. Accepts CSS color strings or Color objects.

```js
render(Fill('red'), Circle(100, 100, 50))
render(Fill(Color.hsl(200, 70, 50)), Circle(100, 100, 50))
```

### Stroke(color)

Set the stroke color.

```js
render(Stroke('#ff0'), LineWidth(3), Circle(100, 100, 50))
```

### LineWidth(w)

Set the stroke weight in pixels.

```js
render(Stroke('white'), LineWidth(4), Line(0, 0, 300, 300))
```

### NoFill()

Disable fill for subsequent shapes.

```js
render(NoFill(), Stroke('white'), Circle(100, 100, 50))
```

### NoStroke()

Disable stroke for subsequent shapes.

```js
render(Fill('blue'), NoStroke(), Rect(50, 50, 200, 100))
```

### Bg(color)

Fill the entire canvas with a background color. Typically the first item in render().

```js
render(Bg('#0a0a1a'), Fill('white'), Circle(200, 200, 50))
```

**p5 equivalent:** `background('#0a0a1a')`

### Alpha(a)

Set global opacity (0 to 1) for subsequent shapes.

```js
render(Alpha(0.5), Fill('red'), Circle(100, 100, 50))
```

### Font(f)

Set font as a CSS font string (legacy). Prefer TextSize() and TextFont() instead.

```js
render(Fill('white'), Font('24px monospace'), Text('hello', 50, 50))
```

### TextSize(size)

Set the text size in pixels.

```js
render(Fill('white'), TextSize(32), Text('big text', 50, 100))
```

**p5 equivalent:** `textSize(32)`

### TextAlign(h, v?)

Set text alignment. h: LEFT, CENTER, RIGHT. v: TOP, CENTER, BASELINE, BOTTOM.

```js
render(Fill('white'), TextAlign('center', 'center'), Text('centered', $width/2, $height/2))
```

**p5 equivalent:** `textAlign(CENTER, CENTER)`

### TextFont(font)

Set the font family.

```js
render(Fill('white'), TextFont('Georgia'), TextSize(20), Text('serif text', 50, 100))
```

**p5 equivalent:** `textFont('Georgia')`

### TextStyle(style)

Set the text style (NORMAL, BOLD, ITALIC, BOLDITALIC).

```js
render(Fill('white'), TextStyle('bold'), Text('bold text', 50, 100))
```

**p5 equivalent:** `textStyle(BOLD)`

### StrokeCap(cap)

Set the stroke cap style (ROUND, SQUARE, PROJECT).

```js
render(Stroke('white'), LineWidth(8), StrokeCap('round'), Line(50, 50, 250, 50))
```

**p5 equivalent:** `strokeCap(ROUND)`

### StrokeJoin(join)

Set the stroke join style (ROUND, MITER, BEVEL).

```js
render(Stroke('white'), LineWidth(4), StrokeJoin('round'), Polygon([[50,150],[150,50],[250,150]]))
```

**p5 equivalent:** `strokeJoin(ROUND)`

### BlendMode(mode)

Set the blend mode. Accepts a string (converted to uppercase p5 constant) or a p5 constant directly.

```js
render(BlendMode('add'), Fill('red'), Circle(150, 150, 80))
```

**p5 equivalent:** `blendMode(ADD)`

### RectMode(mode)

Set the rectangle drawing mode (CORNER, CORNERS, CENTER, RADIUS).

```js
render(RectMode('center'), Fill('blue'), Rect(200, 200, 100, 60))
```

**p5 equivalent:** `rectMode(CENTER)`

### EllipseMode(mode)

Set the ellipse drawing mode (CENTER, RADIUS, CORNER, CORNERS).

```js
render(EllipseMode('corner'), Fill('green'), Ellipse(50, 50, 100, 80))
```

**p5 equivalent:** `ellipseMode(CORNER)`

### Tint(color)

Apply a tint to subsequent images.

```js
render(Tint('red'), Image(img, 0, 0))
```

**p5 equivalent:** `tint('red')`

### NoTint()

Remove image tint.

```js
render(NoTint(), Image(img, 0, 0))
```

**p5 equivalent:** `noTint()`

### Filter(type, param?)

Apply a filter to the canvas. Type can be a string (BLUR, GRAY, INVERT, THRESHOLD, POSTERIZE, ERODE, DILATE, OPAQUE).

```js
render(Bg('white'), Circle(200, 200, 80), Filter('blur', 3))
```

**p5 equivalent:** `filter(BLUR, 3)`

---

## Transforms (Capitalized -- scoped by nested arrays)

Transform directives modify the coordinate system. Use **nested arrays** to scope transforms -- when the nested array ends, transforms are automatically restored (push/pop).

### Translate(x, y)

Move the origin by (x, y).

```js
render([Translate(200, 200), Fill('red'), Circle(0, 0, 50)])
```

**p5 equivalent:** `push(); translate(200, 200); fill('red'); circle(0, 0, 100); pop()`

### Rotate(angle)

Rotate the coordinate system by angle (radians).

```js
render([
  Translate($width/2, $height/2),
  Rotate($t),
  Fill('white'),
  Rect(-50, -50, 100, 100),
])
```

**p5 equivalent:** `push(); translate(width/2, height/2); rotate(t); fill('white'); rect(-50,-50,100,100); pop()`

### Scale(x, y?)

Scale the coordinate system. If only x is given, scales uniformly.

```js
render([Translate(200, 200), Scale(2), Fill('blue'), Circle(0, 0, 30)])
```

**p5 equivalent:** `push(); translate(200, 200); scale(2); fill('blue'); circle(0, 0, 60); pop()`

### Scoping with nested arrays

Nested arrays act as groups -- all transforms and style changes inside are scoped and automatically restored when the array ends.

```js
render(
  Bg('#0a0a1a'),
  // This group has its own transforms and styles
  [Translate(100, 100), Rotate(0.5), Fill('red'), Circle(0, 0, 40)],
  // Back to the original coordinate system
  [Translate(300, 300), Rotate(-0.5), Fill('blue'), Circle(0, 0, 40)],
)
```

---

## Rendering

### render(...items)

The primary way to draw. Accepts any mix of shapes, directives, Color objects, and nested arrays. Can be called multiple times per frame -- each call draws immediately.

```js
// Single call with everything
render(Bg('#0a0a1a'), Fill('white'), Circle(200, 200, 50))

// Multiple calls (both draw)
render(Bg('#0a0a1a'))
render(Fill('red'), Circle(100, 100, 40))
render(Fill('blue'), Circle(300, 300, 40))
```

**How it works:** `render()` walks the items array. Directives update the drawing state, shapes get drawn with the current state, nested arrays push/pop state for scoping. A bare Color object in the array sets the fill color.

### Returning an array (backward compat)

If user code returns an array, it is rendered automatically. This is the legacy API -- prefer explicit `render()` calls.

```js
// Legacy style -- still works
return [Bg('#000'), Fill('white'), Circle(200, 200, 50)]
```

---

## Color

The Color class provides rich color creation, manipulation, and colormaps.

### Color.hsl(h, s, l, a?)

Create a color from hue (0-360), saturation (0-100), lightness (0-100). Optional alpha (0-1, default 1).

```js
render(Fill(Color.hsl(200, 70, 50)), Circle(200, 200, 50))
render(Fill(Color.hsl($t * 60, 80, 55)), Circle(200, 200, 50))  // cycling hue
```

### Color.rgb(r, g, b, a?)

Create a color from red, green, blue (0-255). Optional alpha (0-1, default 1).

```js
render(Fill(Color.rgb(255, 0, 128)), Circle(200, 200, 50))
```

### Color.hex(str)

Create a color from a hex string. Supports #RGB, #RRGGBB, and #RRGGBBAA.

```js
render(Fill(Color.hex('#ff6633')), Circle(200, 200, 50))
```

### Color.auto(i)

Get color i from the built-in Mathematica ColorData[97] palette (10 colors, wraps around).

```js
// Draw 10 circles, each a different palette color
const circles = subdivide({i: 10}).map(({i}) => [
  Fill(Color.auto(i)), Circle(50 + i * 40, 200, 15)
])
render(circles)
```

### Color.rainbow(t)

Rainbow colormap. t in [0, 1] maps to hue 0-360 at saturation 80, lightness 55.

```js
render(Fill(Color.rainbow($t % 1)), Circle(200, 200, 50))
```

### Color.viridis(t)

Viridis perceptually uniform colormap. t in [0, 1].

```js
const dots = subdivide({i: 20}).map(({i}) => [
  Fill(Color.viridis(i / 20)), Circle(50 + i * 20, 200, 8)
])
render(dots)
```

### Color.palette

The raw palette array (10 Color objects). Same colors accessed by Color.auto().

```js
const n = Color.palette.length  // 10
```

### color.mix(other, t?)

Blend between two colors. t = 0 returns this, t = 1 returns other (default 0.5).

```js
const a = Color.auto(0)
const b = Color.auto(3)
render(Fill(a.mix(b, 0.5)), Circle(200, 200, 50))
```

### color.alpha(a)

Return a new color with the given alpha.

```js
render(Fill(Color.hex('#ff0000').alpha(0.5)), Circle(200, 200, 50))
```

### color.lighten(amount)

Return a lighter color. Amount is 0-1 (fraction of lightness to add).

```js
render(Fill(Color.auto(0).lighten(0.2)), Circle(200, 200, 50))
```

### color.darken(amount)

Return a darker color. Amount is 0-1.

```js
render(Fill(Color.auto(0).darken(0.2)), Circle(200, 200, 50))
```

### color.toCSS()

Convert to a CSS color string. Called automatically when colors are passed to Fill/Stroke.

```js
const cssStr = Color.hsl(200, 70, 50).toCSS()  // "rgb(38, 153, 217)"
```

### color.toHSL()

Convert to an HSL object with h (0-360), s (0-100), l (0-100) properties.

```js
const { h, s, l } = Color.auto(0).toHSL()
```

### Passing a Color object directly

A bare Color object in the render array sets the fill color.

```js
render(Color.hsl(0, 80, 50), Circle(200, 200, 50))  // red fill
```

---

## Math

Standard math functions and utilities, available as top-level names.

### lerp(a, b, t)

Linear interpolation from a to b. Returns a + (b - a) * t.

```js
const x = lerp(100, 500, $beat.progress)  // slides from 100 to 500
```

### clamp(x, lo?, hi?)

Clamp x to [lo, hi]. Defaults: lo = 0, hi = 1.

```js
const v = clamp(sin($t), 0, 1)
```

### map(v, inMin, inMax, outMin, outMax)

Map a value from one range to another.

```js
const x = map($mouseX, 0, $width, -1, 1)  // mouse position as -1 to 1
```

### ease(a, b?, t?, fn?)

Smoothstep and interpolation utility. Multiple calling conventions:

- `ease(t)` -- smoothstep (t^2 * (3 - 2t))
- `ease(a, b, t)` -- linear interpolation from a to b
- `ease(a, b, t, fn)` -- eased interpolation using fn

```js
const smooth = ease($beat.progress)  // smoothstep
const x = ease(100, 500, $beat.progress, easeOutCubic)
```

### noise(x)

1D value noise. Returns smooth pseudo-random values in [0, 1].

```js
const y = noise($t * 2) * $height
```

### noise2(x, y)

2D value noise. Returns smooth pseudo-random values in [0, 1].

```js
const n = noise2(x * 0.01, y * 0.01 + $t)
```

### If(cond, a, b)

Conditional expression helper (like a ternary).

```js
render(Fill(If($beat.active, 'red', 'gray')), Circle(200, 200, 50))
```

### Math builtins

All standard math functions and constants are available as top-level names:

| Name | Value |
|------|-------|
| `PI` | 3.14159... |
| `TWO_PI` | 6.28318... |
| `HALF_PI` | 1.5708... |
| `sin`, `cos`, `tan` | Trigonometric functions |
| `abs` | Absolute value |
| `sqrt` | Square root |
| `pow` | Power |
| `floor`, `ceil`, `round` | Rounding |
| `min`, `max` | Min/max (variadic) |
| `random` | Random number in [0, 1) |
| `atan2` | Two-argument arctangent |
| `log`, `exp` | Natural log and exponential |

```js
const x = $width/2 + cos($t) * 100
const y = $height/2 + sin($t) * 100
render(Fill('white'), Circle(x, y, 20))
```

---

## Easing Functions

All 34 easing functions take t in [0, 1] and return a value in [0, 1] (with overshoot possible for Back, Elastic, and Bounce). Each is available as a top-level function.

### Standard Penner Easings (33 functions)

| Curve | In | Out | InOut |
|-------|----|-----|-------|
| Linear | `easeLinear` | -- | -- |
| Sine | `easeInSine` | `easeOutSine` | `easeInOutSine` |
| Quad | `easeInQuad` | `easeOutQuad` | `easeInOutQuad` |
| Cubic | `easeInCubic` | `easeOutCubic` | `easeInOutCubic` |
| Quart | `easeInQuart` | `easeOutQuart` | `easeInOutQuart` |
| Quint | `easeInQuint` | `easeOutQuint` | `easeInOutQuint` |
| Expo | `easeInExpo` | `easeOutExpo` | `easeInOutExpo` |
| Circ | `easeInCirc` | `easeOutCirc` | `easeInOutCirc` |
| Back | `easeInBack` | `easeOutBack` | `easeInOutBack` |
| Elastic | `easeInElastic` | `easeOutElastic` | `easeInOutElastic` |
| Bounce | `easeInBounce` | `easeOutBounce` | `easeInOutBounce` |

```js
const y = lerp(400, 100, easeOutBounce($beat.progress))
render(Fill('white'), Circle(200, y, 20))
```

### cubicBezier(x1, y1, x2, y2)

Returns a custom easing function defined by a CSS-style cubic bezier curve.

```js
const myEase = cubicBezier(0.68, -0.55, 0.27, 1.55)
const x = lerp(100, 500, myEase($beat.progress))
```

### spring(stiffness?, damping?)

Returns a spring physics easing function. Defaults: stiffness = 100, damping = 10 (snappy, slightly bouncy).

```js
const springy = spring(120, 8)
const y = lerp(400, 100, springy($beat.progress))
```

### Using easing names as strings

When calling `.ease()` on an interval, you can pass an easing function or a short string name:

| String name | Function |
|-------------|----------|
| `"linear"` | easeLinear |
| `"inSine"` | easeInSine |
| `"outSine"` | easeOutSine |
| `"inOutSine"` | easeInOutSine |
| `"inQuad"` | easeInQuad |
| `"outQuad"` | easeOutQuad |
| `"inOutQuad"` | easeInOutQuad |
| `"inCubic"` | easeInCubic |
| `"outCubic"` | easeOutCubic |
| `"inOutCubic"` | easeInOutCubic |
| `"inQuart"` | easeInQuart |
| `"outQuart"` | easeOutQuart |
| `"inOutQuart"` | easeInOutQuart |
| `"inQuint"` | easeInQuint |
| `"outQuint"` | easeOutQuint |
| `"inOutQuint"` | easeInOutQuint |
| `"inExpo"` | easeInExpo |
| `"outExpo"` | easeOutExpo |
| `"inOutExpo"` | easeInOutExpo |
| `"inCirc"` | easeInCirc |
| `"outCirc"` | easeOutCirc |
| `"inOutCirc"` | easeInOutCirc |
| `"inBack"` | easeInBack |
| `"outBack"` | easeOutBack |
| `"inOutBack"` | easeInOutBack |
| `"inElastic"` | easeInElastic |
| `"outElastic"` | easeOutElastic |
| `"inOutElastic"` | easeInOutElastic |
| `"inBounce"` | easeInBounce |
| `"outBounce"` | easeOutBounce |
| `"inOutBounce"` | easeInOutBounce |

---

## Intervals & Timing

The timing system divides time into a repeating loop of 8 beats (synced to audio at 126.09 BPM). Each beat and the overall loop are Interval objects with reactive properties.

### $beat

The current beat -- always active, cycles every beat duration. Useful for animations that pulse on every beat.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `.progress` | number (0-1) | How far through the current beat |
| `.active` | boolean | Always true for $beat |
| `.s` | number | Start time of the current beat (within the loop) |
| `.e` | number | End time of the current beat (within the loop) |
| `.len` | number | Duration of one beat in seconds |
| `.n` | number | Total number of beats elapsed since start |
| `.t` | number | Time elapsed within the current beat (0 to .len) |

```js
const y = lerp(400, 100, easeOutBounce($beat.progress))
render(Fill('white'), Circle(200, y, 20))
```

### $beat.ease(name, from?, to?)

Apply an easing function to the beat's progress. Accepts a function or string name.

```js
// Just eased progress (0-1)
const eased = $beat.ease("outCubic")

// Eased and mapped to a range
const y = $beat.ease(easeOutBounce, 400, 100)
```

### $loop

The full loop interval (all 8 beats). Same properties as $beat but spans the entire loop.

```js
const angle = $loop.progress * TWO_PI  // one full rotation per loop
```

### $beat1 through $beat8

Individual beat intervals. $beat1 is the first beat, $beat8 is the last. Each has the same properties as $beat, but `.active` is only true during that specific beat.

```js
const pulse = $beat1.active ? $beat1.ease("outElastic") : 0
render(Fill('red'), Circle(200, 200, 30 + pulse * 20))
```

### $beats

Array of all 8 beat intervals. $beats[0] is $beat1, $beats[7] is $beat8.

```js
const dots = subdivide({i: 8}).map(({i}) => {
  const beat = $beats[i]
  const pulse = beat.active ? beat.ease("outCubic") : 0
  return [Fill(Color.auto(i)), Circle(50 + i * 50, 200, 10 + pulse * 20)]
})
render(dots)
```

### tween(interval, from, to, easeFn?)

Convenience function: map an interval's progress to a value range with optional easing.

```js
const x = tween($beat, 100, 500, "outCubic")
const y = tween($beat1, 400, 100, easeOutBounce)
```

The easeFn can be a function or a string name from the easing map.

---

## Utilities

### subdivide(spec)

Create a parameter space -- an array of objects with the specified fields. The core tool for "think in spaces, not variables."

**Range syntax:**

| Spec | Result |
|------|--------|
| `{i: 8}` | i from 0 to 7 (8 integers) |
| `{t: {from: 0, to: 1, size: 60}}` | 60 evenly spaced values from 0 to 1 |
| `{x: {from: 0, to: 100, step: 10}}` | 0, 10, 20, ..., 100 |

Multiple keys produce the cartesian product:

```js
// 10x10 grid = 100 objects
const grid = subdivide({
  x: {from: 0, to: $width, size: 10},
  y: {from: 0, to: $height, size: 10},
})
```

**Returns** an array with a `.mapWith()` method for chaining derived fields.

```js
const dots = subdivide({i: {from: 0, to: TWO_PI, size: 60}})
  .mapWith(({i}) => ({ x: cos(i) * 100 + 200, y: sin(i) * 100 + 200 }))
  .map(({x, y}) => [Fill('white'), Circle(x, y, 3)])
render(dots)
```

### subdivide(...).mapWith(fn)

Derive new fields from existing ones without losing the originals. Returns a new array with `.mapWith()` still attached for further chaining.

```js
subdivide({i: 10})
  .mapWith(({i}) => ({ angle: (i / 10) * TWO_PI }))
  .mapWith(({angle}) => ({ x: cos(angle) * 100, y: sin(angle) * 100 }))
  .map(({x, y}) => [Fill('white'), Circle(x + 200, y + 200, 5)])
```

### table(spec, fn)

Mathematica-style declarative iteration. Like subdivide but calls fn for each combination and collects results.

**Range syntax:**

| Spec | Result |
|------|--------|
| `{i: 8}` | i from 1 to 8 |
| `{i: [3, 10]}` | i from 3 to 10 |
| `{i: [3, 10, 2]}` | i from 3 to 10, step 2 |
| `{i: {from: 3, to: 10, step: 2}}` | same as above |

Note: table counts from 1 by default, while subdivide counts from 0.

```js
const grid = table({i: 5, j: 5}, ({i, j}) => [
  Fill(Color.hsl(i * 40 + j * 40, 70, 50)),
  Circle(i * 80, j * 80, 20),
])
render(grid)
```

### val(current, min?, max?)

Identity function (returns current). Reserved for future use as an inline slider widget in the editor.

```js
const r = val(50, 10, 200)  // returns 50; will be a draggable slider later
render(Fill('white'), Circle(200, 200, r))
```

### make3D(nx, ny, nz, fillFn?)

Create a 3D array of size nx x ny x nz. Optional fillFn(x, y, z) initializes each cell (default: 0).

```js
const grid = make3D(10, 10, 10, (x, y, z) => noise2(x * 0.3, y * 0.3) > 0.5 ? 1 : 0)
```

### probe(label, value, hz?)

Rate-limited value inspector. Displays a labeled value on the editor HUD and logs to console. Returns the value for inline use. Default refresh rate: 3 Hz.

```js
const x = probe('mouseX', $mouseX)  // shows on HUD, returns $mouseX
probe('beat', $beat.progress, 10)   // update 10 times per second
```

Single-argument shorthand: `probe(expr)` auto-labels with the expression text.

```js
probe($beat.progress)  // auto-labeled as "$beat.progress"
```

### draw(ctx, items)

Lower-level render call that takes a canvas 2D context explicitly. Used internally; prefer `render()`.

```js
draw(ctx, [Fill('red'), Circle(100, 100, 50)])
```

---

## Vector & Complex

### vec2(x, y?)

Create an immutable 2D vector. y defaults to 0.

**Instance methods:**

| Method | Description |
|--------|-------------|
| `.add(b)` | Vector addition |
| `.sub(b)` | Vector subtraction |
| `.scale(s)` | Scalar multiplication |
| `.neg()` | Negate both components |
| `.perp()` | Perpendicular vector (-y, x) |
| `.dot(b)` | Dot product |
| `.cross(b)` | 2D cross product (scalar) |
| `.norm()` | Unit vector |
| `.rotate(a)` | Rotate by angle a (radians) |
| `.dist(b)` | Distance to another vector |
| `.lerp(b, t)` | Linear interpolation |
| `.mag` | Magnitude (property) |
| `.angle` | Angle in radians (property) |

**Static methods:**

| Method | Description |
|--------|-------------|
| `vec2.fromAngle(a, r?)` | Create from angle and optional radius (default 1) |
| `vec2.zero` | The zero vector (0, 0) |
| `vec2.add(a, b)` | Add two vectors |
| `vec2.sub(a, b)` | Subtract two vectors |
| `vec2.scale(a, s)` | Scale a vector |
| `vec2.dot(a, b)` | Dot product |
| `vec2.cross(a, b)` | Cross product |
| `vec2.dist(a, b)` | Distance between two vectors |
| `vec2.lerp(a, b, t)` | Interpolate between two vectors |

```js
const a = vec2(100, 200)
const b = vec2(300, 100)
const mid = a.lerp(b, 0.5)
render(Fill('white'), Circle(mid.x, mid.y, 10))
```

### complex(re, im?)

Create an immutable complex number. im defaults to 0.

**Instance methods:**

| Method | Description |
|--------|-------------|
| `.add(b)` | Addition (b can be a number) |
| `.sub(b)` | Subtraction |
| `.mul(b)` | Multiplication |
| `.div(b)` | Division |
| `.conj()` | Complex conjugate |
| `.neg()` | Negate |
| `.inv()` | Multiplicative inverse |
| `.pow(n)` | Raise to power n |
| `.sqrt()` | Square root |
| `.exp()` | Complex exponential |
| `.log()` | Complex logarithm |
| `.lerp(b, t)` | Linear interpolation |
| `.abs` | Magnitude (property) |
| `.arg` | Argument/angle (property) |

**Static methods:**

| Method | Description |
|--------|-------------|
| `complex.fromPolar(r, a)` | Create from polar coordinates |
| `complex.i` | The imaginary unit (0 + 1i) |
| `complex.add(a, b)` | Add |
| `complex.sub(a, b)` | Subtract |
| `complex.mul(a, b)` | Multiply |
| `complex.div(a, b)` | Divide |
| `complex.exp(z)` | Exponential |
| `complex.log(z)` | Logarithm |
| `complex.pow(z, n)` | Power |
| `complex.sqrt(z)` | Square root |

```js
const z = complex(1, 2)       // 1 + 2i
const w = z.mul(complex.i)    // rotate 90 degrees
render(Fill('white'), Circle(200 + w.re * 50, 200 + w.im * 50, 5))
```

---

## Persistent State (`$$` prefix)

Variables prefixed with `$$` persist across recompiles. They survive code edits without resetting. Useful for accumulators, particle state, or anything that should not reset when you change code.

```js
if ($$count === undefined) $$count = 0
$$count += 1
render(Fill('white'), Text(`Frame: ${$$count}`, 50, 50))
```

`$$foo` is rewritten by the compiler to `__state__["foo"]`, backed by a persistent object in the engine.

---

## p5.js Escape Hatch

The p5 instance is available as `p` in user code. Use it for anything not covered by the declarative API. All p5 functions are accessible via `p.functionName()`.

The raw Canvas 2D context is also available as `ctx` for direct canvas manipulation.

### Using blend modes

```js
render(Bg('#000'))
p.blendMode(p.ADD)
render(
  Fill(Color.hsl(0, 80, 50).alpha(0.5)), Circle(180, 200, 80),
  Fill(Color.hsl(120, 80, 50).alpha(0.5)), Circle(250, 200, 80),
  Fill(Color.hsl(240, 80, 50).alpha(0.5)), Circle(215, 140, 80),
)
```

### Offscreen buffer

```js
const g = p.createGraphics(200, 200)
g.background(0)
g.fill(255)
g.circle(100, 100, 80)
render(Image(g, 100, 100, 200, 200))
```

### Pixel manipulation

```js
p.loadPixels()
for (let y = 0; y < $height; y++) {
  for (let x = 0; x < $width; x++) {
    const idx = (y * $width + x) * 4
    p.pixels[idx] = x % 256       // R
    p.pixels[idx+1] = y % 256     // G
    p.pixels[idx+2] = 128         // B
    p.pixels[idx+3] = 255         // A
  }
}
p.updatePixels()
```

### Mixing imperative p5 with declarative render()

You can freely mix `p.xxx()` calls with `render()`. Both draw to the same canvas.

```js
render(Bg('#0a0a1a'))

// Declarative shapes
render(Fill('red'), Circle(100, 100, 40))

// Imperative p5 drawing
p.stroke(255)
p.strokeWeight(2)
p.noFill()
p.bezier(200, 100, 250, 50, 350, 50, 400, 100)

// More declarative shapes on top
render(Fill('blue'), NoStroke(), Circle(300, 300, 40))
```

### Using ctx directly

The raw Canvas 2D context works for fine-grained control. See the "3D Box Grid" demo for a full example.

```js
ctx.fillStyle = '#0a0a1a'
ctx.fillRect(0, 0, $width, $height)
ctx.fillStyle = Color.hsl(200, 70, 50).toCSS()
ctx.beginPath()
ctx.arc(200, 200, 50, 0, TWO_PI)
ctx.fill()
```

---

## Backward Compatibility

These aliases exist for convenience and backward compatibility. The `$`-prefixed names are canonical.

| Alias | Canonical | Description |
|-------|-----------|-------------|
| `t` | `$t` | Elapsed time in seconds |
| `W` | `$width` | Canvas width |
| `H` | `$height` | Canvas height |

```js
// Both are equivalent:
render(Circle($width/2, $height/2, 50))
render(Circle(W/2, H/2, 50))
```
