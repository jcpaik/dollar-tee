// Transforms scoped by nested arrays
render(Bg('#0a0a1a'))

// Center of canvas
const cx = $width / 2, cy = $height / 2

// Orbiting groups of shapes — each group is rotated
const groups = subdivide({i: 6})
  .map(({i}) => {
    const angle = (i / 6) * TWO_PI + $t * 0.5
    return [
      Translate(cx, cy),
      Rotate(angle),
      Translate(130, 0),
      Fill(Color.hsl(i * 60 + $t * 30, 70, 55)),
      NoStroke(),
      Circle(0, 0, 25),
      [Rotate($t * 2),
        Stroke(Color.hsl(i * 60 + $t * 30, 70, 75)),
        NoFill(),
        LineWidth(2),
        Ngon(0, 0, 40, 4 + i, 0),
      ],
    ]
  })

render(groups)
