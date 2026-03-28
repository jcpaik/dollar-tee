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
