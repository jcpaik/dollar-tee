// Spinning polygons with trails
ctx.fillStyle = 'rgba(10, 10, 26, 0.12)'
ctx.fillRect(0, 0, $width, $height)

const cx = $width / 2, cy = $height / 2
const sides = 5 + floor(sin($time * 0.3) * 2 + 2)
const baseR = min($width, $height) * 0.3

const polys = range({j: [0, 2]})
  .mapWith(({j}) => ({
    r: baseR * (0.5 + j * 0.25),
    angle: $time * (0.5 + j * 0.2) * (j % 2 ? -1 : 1),
  }))
  .map(({j, r, angle}) => [
    NoFill(),
    Stroke(Color.hsl($time * 50 + j * 120, 80, 55)),
    LineWidth(2),
    Polygon(range(sides).map(k => [cx + cos(angle + k/sides*TWO_PI)*r, cy + sin(angle + k/sides*TWO_PI)*r])),
  ])

render(polys)
