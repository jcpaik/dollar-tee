// Flowing sine wave lines

/*
const waves = range({j: 40, i: 80})
  .mapWith(({j, i}) => {
    const y0 = (j / 40) * $height
    const amp = sin($time * 0.5 + j * 0.2) * 30 + 20
    const phase = i * 0.15 + j * 0.1 + $time
    return {
      x: (i / 80) * $width,
      y: y0 + sin(phase) * amp,
      xNext: ((i + 1) / 80) * $width,
      yNext: y0 + sin(phase + 0.15) * amp,
    }
  })
  .map(({j, x, y, xNext, yNext}) => [
    Stroke(Color.hsl(j * 8 + $time * 30, 70, 50)),
    LineWidth(1.5), NoFill(), StrokeCap(p.SQUARE),
    Line(x, y, xNext, yNext),
  ])
*/

// render(Background('#0a0a1a'), waves)

render(Background('#0a0a1a'))