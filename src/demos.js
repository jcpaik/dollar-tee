// Demo sketches — each is a code string that gets eval'd.
// User code receives: ctx, t, W, H, and all stdlib names as locals.

export const DEMOS = {

  "Blank Canvas": `\
// Your blank canvas — go wild!
// Available: ctx, t (seconds), W, H (canvas size)
// Shapes:  circle(x,y,r)  rect(x,y,w,h)  line(x1,y1,x2,y2)  polygon(pts)
//          ngon(x,y,r,sides,angle)  arc(x,y,r,start,end)  ellipse(x,y,rx,ry)
// Style:   fill(color)  stroke(color)  lineWidth(w)  bg(color)  noFill()  noStroke()
// Color:   Color.hsl(h,s,l)  Color.rgb(r,g,b)  Color.hex('#fff')  Color.auto(i)
// Math:    lerp  ease  map  clamp  noise  noise2  sin cos abs ...
// Easing:  easeInQuad  easeOutCubic  easeInOutElastic  easeOutBounce  ...
//          cubicBezier(x1,y1,x2,y2)  spring(stiffness, damping)
// Beats:   $beat  $loop  $beat1–$beat8  $beats[i]  tween($beat1, 0, 100, "outCubic")
//          $beat1.ease("outCubic")  $beat1.n (count)  $beat1.t (elapsed)
// Render:  render(fill('red'), circle(x,y,r))  — call anywhere, multiple times
// Space:   subdivide({t: {from: 0, to: 1, size: 60}})  — parameter array
//          .mapWith(({t}) => ({angle: t * TWO_PI}))     — derive new fields

render(bg('#0a0a1a'))
`,

  "Pulsing Circles": `\
// Concentric circles pulsing to the beat
const circles = subdivide({i: {from: 12, to: 0, size: 13}})
  .mapWith(({i}) => {
    const beat = $beats[i % 8]
    return { pulse: beat.active ? beat.ease("outCubic") : 0 }
  })
  .map(({i, pulse}) => [
    fill(Color.hsl(t * 30 + i * 25, 70, 40 + pulse * 20)),
    circle(W/2, H/2, lerp(20, min(W,H) * 0.45, i / 12) * (0.7 + 0.3 * pulse)),
  ])

render(bg('#0a0a1a'), circles)
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
const cellW = (W - padX * 2) / cols
const cellH = (H - padY * 2) / rows
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

  // Connect consecutive points into line segments
  const curve = pts.slice(0, -1).map((p, k) => [
    stroke(Color.hsl(idx * 20, 70, 55)), lineWidth(1.5),
    line(p.px, p.py, pts[k + 1].px, pts[k + 1].py),
  ])

  return [
    fill('#666'), font('11px monospace'), text(name, ox + 4, oy + 14),
    [stroke('#333'), lineWidth(1), noFill(),
      line(ox, oy + gh + 20, ox + gw, oy + gh + 20),
      line(ox, oy + 20, ox, oy + gh + 20)],
    curve,
    fill('#fff'), noStroke(),
    circle(ox + progress * gw, oy + gh + 20 - fn(progress) * gh, 3),
  ]
})

render(bg('#0a0a1a'), gallery)
`,

  "Bouncing Dots": `\
// Bouncing dots synced to the beat — each uses a different easing
const easings = [
  easeOutBounce, easeOutElastic, easeOutBack,
  easeOutCubic, easeOutExpo, easeOutCirc,
]
const spacing = W / (easings.length + 1)

const dots = easings.map((fn, i) => {
  const x = spacing * (i + 1)
  const eased = $beat.ease(fn)
  const y = lerp(H * 0.85, H * 0.15, eased)
  const r = 15 + eased * 10
  return [
    [alpha(0.3), fill(Color.hsl(i * 60, 70, 40)), noStroke(), circle(x, y, r * 0.6)],
    [alpha(1), fill(Color.hsl(i * 60, 70, 55)), circle(x, y, r)],
  ]
})

render(bg('#0a0a1a'), dots)
`,

  "Dot Grid": `\
// 2D parameter space mapped to visual properties
// Nested ngons from a range
const ngons = subdivide({i: {from: 1, to: 6, size: 6}})
  .map(({i}) =>
    ngon(W/2, H/2, min(W,H) * 0.05 * i, 3 + i, t * (0.5 + i * 0.1))
  )

// 2D grid — subdivide creates the position space, mapWith derives values
const dots = subdivide({
    x: {from: W * 0.1, to: W * 0.82, size: 10},
    y: {from: H * 0.1, to: H * 0.82, size: 10},
  })
  .mapWith(({x, y}) => ({
    pulse: easeOutCubic(abs(sin(t + x * 0.01 + y * 0.01))),
  }))
  .map(({x, y, pulse}) => [
    fill(Color.hsl(x * 0.4 + y * 0.4 + t * 40, 70, 40 + pulse * 25)),
    noStroke(),
    circle(x, y, 8 + pulse * 12),
  ])

render(bg('#0a0a1a'), fill('#333'), noStroke(), ngons, dots)
`,

  "3D Box Grid": `\
// Isometric box grid — imperative mode using ctx directly
const cs = 28, N = 6
const isoX = (x, y) => (x - y) * cs * 0.866
const isoY = (x, y, z) => (x + y) * cs * 0.5 - z * cs

ctx.fillStyle = '#0a0a1a'
ctx.fillRect(0, 0, W, H)

for (let z = 0; z < 3; z++) {
  for (let y = N - 1; y >= 0; y--) {
    for (let x = 0; x < N; x++) {
      const wave = sin(t + x * 0.5 + y * 0.5 + z) * 0.5 + 0.5
      if (wave < 0.3) continue

      const sx = W / 2 + isoX(x, y)
      const sy = H * 0.35 + isoY(x, y, z)
      const hue = t * 40 + x * 30 + z * 60

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
ctx.fillRect(0, 0, W, H)

const cx = W / 2, cy = H / 2
const sides = 5 + floor(sin(t * 0.3) * 2 + 2)
const baseR = min(W, H) * 0.3

const polys = subdivide({j: {from: 0, to: 2, size: 3}})
  .mapWith(({j}) => ({
    r: baseR * (0.5 + j * 0.25),
    angle: t * (0.5 + j * 0.2) * (j % 2 ? -1 : 1),
  }))
  .map(({j, r, angle}) => [
    noFill(),
    stroke(Color.hsl(t * 50 + j * 120, 80, 55)),
    lineWidth(2),
    ngon(cx, cy, r, sides, angle),
  ])

render(polys)
`,

  "Color Field": `\
// Noise-based animated color grid
const step = 10

const colors = subdivide({
    x: {from: 0, to: W - step, step: step},
    y: {from: 0, to: H - step, step: step},
  })
  .mapWith(({x, y}) => ({
    n: noise2(x / W * 4 + sin(t * 0.3) * 2, y / H * 4 + t * 0.2),
  }))
  .map(({x, y, n}) => [
    fill(Color.hsl(n * 360 + t * 20, 60 + n * 30, 30 + n * 35)),
    noStroke(),
    rect(x, y, step, step),
  ])

render(colors)
`,

  "Line Wave": `\
// Flowing sine wave lines
const waves = subdivide({j: 40, i: 80})
  .mapWith(({j, i}) => {
    const y0 = (j / 40) * H
    const amp = sin(t * 0.5 + j * 0.2) * 30 + 20
    const phase = i * 0.15 + j * 0.1 + t
    return {
      x: (i / 80) * W,
      y: y0 + sin(phase) * amp,
      xNext: ((i + 1) / 80) * W,
      yNext: y0 + sin(phase + 0.15) * amp,
    }
  })
  .map(({j, x, y, xNext, yNext}) => [
    stroke(Color.hsl(j * 8 + t * 30, 70, 50)),
    lineWidth(1.5), noFill(),
    line(x, y, xNext, yNext),
  ])

render(bg('#0a0a1a'), waves)
`,

  "Bouncing Beats": `\
// Bouncing circles on different intervals, colored by scheme
const easings = [
  easeOutBounce, easeOutElastic, easeOutBack,
  easeOutCubic, easeOutExpo, easeOutCirc,
  easeOutQuad, easeOutBounce,
]
const spacing = W / 9

const beats = subdivide({i: 8})
  .mapWith(({i}) => {
    const beat = $beats[i]
    const eased = beat.active ? beat.ease(easings[i]) : 0
    return {
      x: spacing * (i + 1),
      c: Color.viridis(i / 8),
      eased,
      y: lerp(H * 0.82, H * 0.18, eased),
      r: 12 + eased * 18,
    }
  })
  .map(({x, y, r, c, eased}) => [
    [alpha(0.2 + eased * 0.15), fill(c), noStroke(), circle(x, H * 0.82, r * 0.5)],
    [alpha(0.6 + eased * 0.4), fill(c), noStroke(), circle(x, y, r)],
  ])

render(
  bg('#0a0a1a'),
  beats,
  stroke('#333'), lineWidth(1), noFill(),
  line(spacing * 0.5, H * 0.85, W - spacing * 0.5, H * 0.85),
)
`,

  "Palette Demo": `\
// Mathematica ColorData[97] palette + Color class
const n = Color.palette.length
const sz = min(W, H) * 0.06
const gap = sz * 0.4
const cx = W / 2, cy = H * 0.5
const a = Color.auto(0)
const b = Color.auto(3)
const ringR = min(W, H) * 0.25
const ringY = H * 0.78

// Palette swatches — index space mapped to position + beat pulse
const swatches = subdivide({i: n})
  .mapWith(({i}) => {
    const beat = $beats[i % 8]
    return {
      x: W / 2 - (n * (sz + gap)) / 2 + i * (sz + gap) + sz/2,
      pulse: beat.active ? beat.ease("outElastic") : 0,
    }
  })
  .map(({i, x, pulse}) => [
    fill(Color.auto(i)), noStroke(),
    circle(x, H * 0.15, sz/2 * (0.8 + 0.4 * pulse)),
  ])

// Color mixing — [0, 1] space mapped to blended colors
const mixing = subdivide({s: {from: 0, to: 1, size: 11}})
  .map(({s}) => [
    fill(a.mix(b, s)), noStroke(),
    rect(cx - 200 + s * 400, cy, 35, 35),
  ])

// Rainbow ring — [0, 1) space mapped to angle, then to position
const rainbow = subdivide({i: 60})
  .mapWith(({i}) => ({
    s: i / 60,
    angle: (i / 60) * TWO_PI + t * 0.5,
  }))
  .map(({s, angle}) => [
    fill(Color.rainbow(s)), noStroke(),
    circle(cx + cos(angle) * ringR, ringY + sin(angle) * ringR * 0.4, 8),
  ])

render(bg('#0a0a1a'), swatches, mixing, rainbow)
`,
};
