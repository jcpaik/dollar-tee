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

render(Background('#0a0a1a'), dots)
