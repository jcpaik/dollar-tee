// Noise-based animated color grid
const step = 10

const colors = table({
    x: {to: $width - step, step: step},
    y: {to: $height - step, step: step},
  })
  .mapWith(({x, y}) => ({
    n: noise2(x / $width * 4 + sin($time * 0.3) * 2, y / $height * 4 + $time * 0.2),
  }))
  .map(({x, y, n}) => [
    Fill(Color.hsl(n * 360 + $time * 20, 60 + n * 30, 30 + n * 35)),
    NoStroke(),
    Rect(x, y, step, step),
  ])

render(colors)
