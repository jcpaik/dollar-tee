// Demo sketches — each is a code string that gets eval'd.
// User code receives: ctx and all stdlib names as locals.

export const DEMOS = {

  "Blank Canvas": `\
// Your blank canvas — go wild!
// Available: ctx, $t (seconds), $width, $height, $mouseX, $mouseY
// Shapes:  Circle(x,y,r)  Rect(x,y,w,h)  Line(x1,y1,x2,y2)  Polygon(pts)
//          Ngon(x,y,r,sides,angle)  Arc(x,y,r,start,end)  Ellipse(x,y,rx,ry)
//          Shape(pts)  Bezier(x1,y1,cx1,cy1,cx2,cy2,x2,y2)  Image(img,x,y,w,h)
// Style:   Fill(color)  Stroke(color)  LineWidth(w)  Bg(color)  NoFill()  NoStroke()
//          BlendMode(mode)  StrokeCap(cap)  StrokeJoin(join)  Filter(type,param)
// Xform:  Translate(x,y)  Rotate(angle)  Scale(s)  — scoped by nested arrays
// Text:   Text(str,x,y)  TextSize(s)  TextAlign(h,v)  TextFont(f)
// Image:  Image(img,x,y,w,h)  Tint(color)  NoTint()
// Color:   Color.hsl(h,s,l)  Color.rgb(r,g,b)  Color.hex('#fff')  Color.auto(i)
// Math:    lerp  ease  map  clamp  noise  noise2  sin cos abs ...
// Easing:  easeInQuad  easeOutCubic  easeInOutElastic  easeOutBounce  ...
//          cubicBezier(x1,y1,x2,y2)  spring(stiffness, damping)
// Beats:   $beat  $loop  $beat1–$beat8  $beats[i]  tween($beat1, 0, 100, "outCubic")
//          $beat1.ease("outCubic")  $beat1.n (count)  $beat1.t (elapsed)
// Render:  render(Fill('red'), Circle(x,y,r))  — call anywhere, multiple times
// Space:   subdivide({t: {from: 0, to: 1, size: 60}})  — parameter array
//          .mapWith(({t}) => ({angle: t * TWO_PI}))     — derive new fields

render(Bg('#0a0a1a'))
`,

  "Pulsing Circles": `\
// Concentric circles pulsing to the beat
const circles = subdivide({i: {from: 12, to: 0, size: 13}})
  .mapWith(({i}) => {
    const beat = $beats[i % 8]
    return { pulse: beat.active ? beat.ease("outCubic") : 0 }
  })
  .map(({i, pulse}) => [
    Fill(Color.hsl($t * 30 + i * 25, 70, 40 + pulse * 20)),
    Circle($width/2, $height/2, lerp(20, min($width,$height) * 0.45, i / 12) * (0.7 + 0.3 * pulse)),
  ])

render(Bg('#0a0a1a'), circles)
`,

  "Easing Gallery": `\
// All easing curves visualized
const easings = [
  ['InSine', easeInSine],       ['OutSine', easeOutSine],       ['InOutSine', easeInOutSine],
  ['InCubic', easeInCubic],     ['OutCubic', easeOutCubic],     ['InOutCubic', easeInOutCubic],
  ['InExpo', easeInExpo],       ['OutExpo', easeOutExpo],       ['InOutExpo', easeInOutExpo],
  ['InBack', easeInBack],       ['OutBack', easeOutBack],       ['InOutBack', easeInOutBack],
  ['InElastic', easeInElastic], ['OutElastic', easeOutElastic], ['InOutElastic', easeInOutElastic],
  ['InBounce', easeInBounce],   ['OutBounce', easeOutBounce],   ['InOutBounce', easeInOutBounce],
]
const cols = 3, rows = 6
const padX = 60, padY = 40
const cellW = ($width - padX * 2) / cols
const cellH = ($height - padY * 2) / rows
const progress = $beat.progress

const gallery = easings.map(([name, fn], idx) => {
  const col = idx % cols, row = floor(idx / cols)
  const ox = padX + col * cellW, oy = padY + row * cellH
  const gw = cellW * 0.7, gh = cellH * 0.55

  // Points along the curve
  const pts = subdivide({s: {from: 0, to: 1, size: 41}})
    .mapWith(({s}) => ({
      px: ox + s * gw,
      py: oy + gh + 20 - fn(s) * gh,
    }))

  // Connect consecutive points into Line segments
  const curve = pts.slice(0, -1).map((p, k) => [
    Stroke(Color.hsl(idx * 20, 70, 55)), LineWidth(1.5),
    Line(p.px, p.py, pts[k + 1].px, pts[k + 1].py),
  ])

  return [
    Fill('#666'), Font('11px monospace'), Text(name, ox + 4, oy + 14),
    [Stroke('#333'), LineWidth(1), NoFill(),
      Line(ox, oy + gh + 20, ox + gw, oy + gh + 20),
      Line(ox, oy + 20, ox, oy + gh + 20)],
    curve,
    Fill('#fff'), NoStroke(),
    Circle(ox + progress * gw, oy + gh + 20 - fn(progress) * gh, 3),
  ]
})

render(Bg('#0a0a1a'), gallery)
`,

  "Bouncing Dots": `\
// Bouncing dots synced to the beat — each uses a different easing
const easings = [
  easeOutBounce, easeOutElastic, easeOutBack,
  easeOutCubic, easeOutExpo, easeOutCirc,
]
const spacing = $width / (easings.length + 1)

const dots = easings.map((fn, i) => {
  const x = spacing * (i + 1)
  const eased = $beat.ease(fn)
  const y = lerp($height * 0.85, $height * 0.15, eased)
  const r = 15 + eased * 10
  return [
    [Alpha(0.3), Fill(Color.hsl(i * 60, 70, 40)), NoStroke(), Circle(x, y, r * 0.6)],
    [Alpha(1), Fill(Color.hsl(i * 60, 70, 55)), Circle(x, y, r)],
  ]
})

render(Bg('#0a0a1a'), dots)
`,

  "Dot Grid": `\
// 2D parameter space mapped to visual properties
// Nested Ngons from a range
const ngons = subdivide({i: {from: 1, to: 6, size: 6}})
  .map(({i}) =>
    Ngon($width/2, $height/2, min($width,$height) * 0.05 * i, 3 + i, $t * (0.5 + i * 0.1))
  )

// 2D grid — subdivide creates the position space, mapWith derives values
const dots = subdivide({
    x: {from: $width * 0.1, to: $width * 0.82, size: 10},
    y: {from: $height * 0.1, to: $height * 0.82, size: 10},
  })
  .mapWith(({x, y}) => ({
    pulse: easeOutCubic(abs(sin($t + x * 0.01 + y * 0.01))),
  }))
  .map(({x, y, pulse}) => [
    Fill(Color.hsl(x * 0.4 + y * 0.4 + $t * 40, 70, 40 + pulse * 25)),
    NoStroke(),
    Circle(x, y, 8 + pulse * 12),
  ])

render(Bg('#0a0a1a'), Fill('#333'), NoStroke(), ngons, dots)
`,

  "3D Box Grid": `\
// Isometric box grid — imperative mode using ctx directly
const cs = 28, N = 6
const isoX = (x, y) => (x - y) * cs * 0.866
const isoY = (x, y, z) => (x + y) * cs * 0.5 - z * cs

ctx.fillStyle = '#0a0a1a'
ctx.fillRect(0, 0, $width, $height)

for (let z = 0; z < 3; z++) {
  for (let y = N - 1; y >= 0; y--) {
    for (let x = 0; x < N; x++) {
      const wave = sin($t + x * 0.5 + y * 0.5 + z) * 0.5 + 0.5
      if (wave < 0.3) continue

      const sx = $width / 2 + isoX(x, y)
      const sy = $height * 0.35 + isoY(x, y, z)
      const hue = $t * 40 + x * 30 + z * 60

      // Top face
      ctx.fillStyle = Color.hsl(hue, 70, 35 + wave * 30).toCSS()
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(sx + cs*0.866, sy + cs*0.5)
      ctx.lineTo(sx, sy + cs)
      ctx.lineTo(sx - cs*0.866, sy + cs*0.5)
      ctx.closePath()
      ctx.fill()

      // Left face
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.moveTo(sx - cs*0.866, sy + cs*0.5)
      ctx.lineTo(sx, sy + cs)
      ctx.lineTo(sx, sy + cs*2)
      ctx.lineTo(sx - cs*0.866, sy + cs*1.5)
      ctx.closePath()
      ctx.fill()

      // Right face
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.beginPath()
      ctx.moveTo(sx + cs*0.866, sy + cs*0.5)
      ctx.lineTo(sx, sy + cs)
      ctx.lineTo(sx, sy + cs*2)
      ctx.lineTo(sx + cs*0.866, sy + cs*1.5)
      ctx.closePath()
      ctx.fill()
    }
  }
}
`,

  "Spinning Polygons": `\
// Spinning polygons with trails
ctx.fillStyle = 'rgba(10, 10, 26, 0.12)'
ctx.fillRect(0, 0, $width, $height)

const cx = $width / 2, cy = $height / 2
const sides = 5 + floor(sin($t * 0.3) * 2 + 2)
const baseR = min($width, $height) * 0.3

const polys = subdivide({j: {from: 0, to: 2, size: 3}})
  .mapWith(({j}) => ({
    r: baseR * (0.5 + j * 0.25),
    angle: $t * (0.5 + j * 0.2) * (j % 2 ? -1 : 1),
  }))
  .map(({j, r, angle}) => [
    NoFill(),
    Stroke(Color.hsl($t * 50 + j * 120, 80, 55)),
    LineWidth(2),
    Ngon(cx, cy, r, sides, angle),
  ])

render(polys)
`,

  "Color Field": `\
// Noise-based animated color grid
const step = 10

const colors = subdivide({
    x: {from: 0, to: $width - step, step: step},
    y: {from: 0, to: $height - step, step: step},
  })
  .mapWith(({x, y}) => ({
    n: noise2(x / $width * 4 + sin($t * 0.3) * 2, y / $height * 4 + $t * 0.2),
  }))
  .map(({x, y, n}) => [
    Fill(Color.hsl(n * 360 + $t * 20, 60 + n * 30, 30 + n * 35)),
    NoStroke(),
    Rect(x, y, step, step),
  ])

render(colors)
`,

  "Line Wave": `\
// Flowing sine wave lines
const waves = subdivide({j: 40, i: 80})
  .mapWith(({j, i}) => {
    const y0 = (j / 40) * $height
    const amp = sin($t * 0.5 + j * 0.2) * 30 + 20
    const phase = i * 0.15 + j * 0.1 + $t
    return {
      x: (i / 80) * $width,
      y: y0 + sin(phase) * amp,
      xNext: ((i + 1) / 80) * $width,
      yNext: y0 + sin(phase + 0.15) * amp,
    }
  })
  .map(({j, x, y, xNext, yNext}) => [
    Stroke(Color.hsl(j * 8 + $t * 30, 70, 50)),
    LineWidth(1.5), NoFill(), StrokeCap(p.SQUARE),
    Line(x, y, xNext, yNext),
  ])

render(Bg('#0a0a1a'), waves)
`,

  "Bouncing Beats": `\
// Bouncing circles on different intervals, colored by scheme
const easings = [
  easeOutBounce, easeOutElastic, easeOutBack,
  easeOutCubic, easeOutExpo, easeOutCirc,
  easeOutQuad, easeOutBounce,
]
const spacing = $width / 9

const beats = subdivide({i: 8})
  .mapWith(({i}) => {
    const beat = $beats[i]
    const eased = beat.active ? beat.ease(easings[i]) : 0
    return {
      x: spacing * (i + 1),
      c: Color.viridis(i / 8),
      eased,
      y: lerp($height * 0.82, $height * 0.18, eased),
      r: 12 + eased * 18,
    }
  })
  .map(({x, y, r, c, eased}) => [
    [Alpha(0.2 + eased * 0.15), Fill(c), NoStroke(), Circle(x, $height * 0.82, r * 0.5)],
    [Alpha(0.6 + eased * 0.4), Fill(c), NoStroke(), Circle(x, y, r)],
  ])

render(
  Bg('#0a0a1a'),
  beats,
  Stroke('#333'), LineWidth(1), NoFill(),
  Line(spacing * 0.5, $height * 0.85, $width - spacing * 0.5, $height * 0.85),
)
`,

  "Palette Demo": `\
// Mathematica ColorData[97] palette + Color class
const n = Color.palette.length
const sz = min($width, $height) * 0.06
const gap = sz * 0.4
const cx = $width / 2, cy = $height * 0.5
const a = Color.auto(0)
const b = Color.auto(3)
const ringR = min($width, $height) * 0.25
const ringY = $height * 0.78

// Palette swatches — index space mapped to position + beat pulse
const swatches = subdivide({i: n})
  .mapWith(({i}) => {
    const beat = $beats[i % 8]
    return {
      x: $width / 2 - (n * (sz + gap)) / 2 + i * (sz + gap) + sz/2,
      pulse: beat.active ? beat.ease("outElastic") : 0,
    }
  })
  .map(({i, x, pulse}) => [
    Fill(Color.auto(i)), NoStroke(),
    Circle(x, $height * 0.15, sz/2 * (0.8 + 0.4 * pulse)),
  ])

// Color mixing — [0, 1] space mapped to blended colors
const mixing = subdivide({s: {from: 0, to: 1, size: 11}})
  .map(({s}) => [
    Fill(a.mix(b, s)), NoStroke(),
    Rect(cx - 200 + s * 400, cy, 35, 35),
  ])

// Rainbow ring — [0, 1) space mapped to angle, then to position
const rainbow = subdivide({i: 60})
  .mapWith(({i}) => ({
    s: i / 60,
    angle: (i / 60) * TWO_PI + $t * 0.5,
  }))
  .map(({s, angle}) => [
    Fill(Color.rainbow(s)), NoStroke(),
    Circle(cx + cos(angle) * ringR, ringY + sin(angle) * ringR * 0.4, 8),
  ])

render(Bg('#0a0a1a'), swatches, mixing, rainbow)
`,

  "Transform Demo": `\
// Transforms scoped by nested arrays
render(Bg('#0a0a1a'))

// Center of canvas
const cx = $width / 2, cy = $height / 2

// Orbiting groups of shapes — each group is rotated
const groups = subdivide({i: 6})
  .map(({i}) => {
    const angle = (i / 6) * TWO_PI + $t * 0.5
    return [
      Translate(cx, cy),
      Rotate(angle),
      Translate(150, 0),
      Fill(Color.hsl(i * 60 + $t * 30, 70, 55)),
      NoStroke(),
      Circle(0, 0, 25),
      [Rotate($t * 2),
        Stroke(Color.hsl(i * 60 + $t * 30, 70, 75)),
        NoFill(),
        LineWidth(2),
        Ngon(0, 0, 40, 4 + i, 0),
      ],
    ]
  })

render(groups)
`,
};
