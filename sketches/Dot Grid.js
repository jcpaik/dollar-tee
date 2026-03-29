// 2D parameter space mapped to visual properties
// Nested regular polygons from a range
const ngons = range([1, 6])
  .map(i => {
    const sides = 3 + i, r = min($width,$height) * 0.05 * i, a = $time * (0.5 + i * 0.1)
    return Polygon(range(sides).map(k => [$width/2 + cos(a + k/sides*TWO_PI)*r, $height/2 + sin(a + k/sides*TWO_PI)*r]))
  })

// 2D grid — range creates the position space, mapWith derives values
const dots = range({
    x: {from: $width * 0.1, to: $width * 0.82, n: 10},
    y: {from: $height * 0.1, to: $height * 0.82, n: 10},
  })
  .mapWith(({x, y}) => ({
    pulse: easeOutCubic(abs(sin($time + x * 0.01 + y * 0.01))),
  }))
  .map(({x, y, pulse}) => [
    Fill(Color.hsl(x * 0.4 + y * 0.4 + $time * 40, 70, 40 + pulse * 25)),
    NoStroke(),
    Circle(x, y, 8 + pulse * 12),
  ])

render(Background('#0a0a1a'), Fill('#333'), NoStroke(), ngons, dots)
