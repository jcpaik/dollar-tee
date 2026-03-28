// Bouncing circles on different intervals, colored by scheme
const easings = [
  easeOutBounce, easeOutElastic, easeOutBack,
  easeOutCubic, easeOutExpo, easeOutCirc,
  easeOutQuad, easeOutBounce,
]
const spacing = $width / 9

const beats = table({i: 8})
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
  Background('#0a0a1a'),
  beats,
  Stroke('#333'), LineWidth(1), NoFill(),
  Line(spacing * 0.5, $height * 0.85, $width - spacing * 0.5, $height * 0.85),
)
