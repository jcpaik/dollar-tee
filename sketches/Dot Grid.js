// 2D parameter space mapped to visual properties
// Nested Ngons from a range
const ngons = table({i: [1, 6]})
  .map(({i}) =>
    Ngon($width/2, $height/2, min($width,$height) * 0.05 * i, 3 + i, $time * (0.5 + i * 0.1))
  )

// 2D grid — table creates the position space, mapWith derives values
const dots = table({
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
