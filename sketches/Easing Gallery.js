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
