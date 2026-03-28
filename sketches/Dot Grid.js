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
