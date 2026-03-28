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
