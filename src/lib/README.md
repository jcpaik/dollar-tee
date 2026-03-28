# lib/

Standalone math and utility libraries. No app dependencies -- these import only from each other or nothing at all.

## Files

### color.js

`Color` class -- RGB/HSL/hex color manipulation.

**Constructors:**
- `Color(r, g, b, a=1)` -- RGB in 0-255, alpha in 0-1
- `Color.rgb(r, g, b, a=1)`
- `Color.hsl(h, s, l, a=1)` -- h in 0-360, s/l in 0-100
- `Color.hex(str)` -- parse `'#rrggbb'` or `'#rgb'`

**Instance methods:**
- `alpha(a)` -- return new Color with modified alpha
- `lighten(amount)`, `darken(amount)` -- adjust lightness
- `mix(other, t=0.5)` -- blend two colors
- `toHSL()` -- return `{ h, s, l }` object
- `toCSS()` / `toString()` -- CSS `rgb()`/`rgba()` string

**Static:**
- `Color.palette` -- 10-color Mathematica ColorData[97] array
- `Color.auto(i)` -- cycle through palette by index
- `Color.viridis(t)` -- viridis colormap, t in [0, 1]
- `Color.rainbow(t)` -- HSL-based rainbow, t in [0, 1]

### complex.js

`complex(re, im=0)` -- immutable complex numbers.

**Instance methods:**
- `add(b)`, `sub(b)`, `mul(b)`, `div(b)` -- arithmetic (accepts numbers as real part)
- `conj()`, `neg()`, `inv()` -- conjugate, negate, inverse
- `pow(n)`, `sqrt()`, `exp()`, `log()` -- transcendental
- `lerp(b, t)` -- linear interpolation
- `abs` (getter), `arg` (getter) -- magnitude, phase

**Static:**
- `complex.fromPolar(r, a)` -- create from polar coordinates
- `complex.i` -- constant `(0, 1)`
- `complex.add/sub/mul/div/exp/log/pow/sqrt(z, ...)` -- functional API

### easing.js

33 Penner easing functions + utilities. All `(t: [0,1]) -> [0,1]` (with overshoot for Back/Elastic).

**Families:** Linear, Sine, Quad, Cubic, Quart, Quint, Expo, Circ, Back, Elastic, Bounce -- each with In/Out/InOut variants (except Linear).

**Utilities:**
- `cubicBezier(x1, y1, x2, y2)` -- CSS-style cubic bezier, returns easing function (Newton-Raphson solver)
- `spring(stiffness=100, damping=10)` -- spring physics easing
- `EASING_MAP` -- lookup by camelCase name: `EASING_MAP['outCubic']`

### schemes.js

Matplotlib-style colormaps. All `(t: [0,1]) -> Color`.

**Imports:** `Color` from `color.js`.

**Scientific (16-point LUT interpolation):**
- `viridis`, `inferno`, `plasma`, `magma`, `cividis`

**Artistic:**
- `sunset`, `ocean`, `thermal`, `fire`, `ice`, `neon`

**HSL-based:**
- `rainbow(t)`

**Utilities:**
- `reverse(scheme)` -- reverse a colormap
- `join(schemeA, schemeB, split=0.5)` -- combine two colormaps
- `schemeFrom(...colors)` -- create from CSS color strings or Color objects

### vec.js

`vec2(x, y=0)` -- immutable 2D vectors.

**Instance methods:**
- `add(b)`, `sub(b)`, `scale(s)`, `neg()` -- arithmetic
- `perp()` -- perpendicular (90-degree rotation)
- `dot(b)`, `cross(b)` -- products
- `norm()` -- normalize to unit vector
- `rotate(a)` -- rotate by angle
- `dist(b)` -- distance to another vector
- `lerp(b, t)` -- linear interpolation
- `mag` (getter), `angle` (getter) -- magnitude, atan2

**Static:**
- `vec2.fromAngle(a, r=1)` -- create from polar
- `vec2.zero` -- constant `(0, 0)`
- `vec2.add/sub/scale/dot/cross/dist/lerp(a, b, ...)` -- functional API
