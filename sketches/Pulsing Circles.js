// Concentric circles pulsing to the beat
const circles = subdivide({i: {from: 12, to: 0, size: 13}})
  .mapWith(({i}) => {
    const beat = $beats[i % 8]
    return { pulse: beat.active ? beat.ease("outCubic") : 0 }
  })
  .map(({i, pulse}) => [
    Fill(Color.hsl($t * 30 + i * 25, 70, 40 + pulse * 20)),
    Circle($width/2, $height/2, lerp(20, min($width,$height) * 0.45, i / 12) * (0.7 + 0.3 * pulse)),
  ])

render(Bg('#0a0a1a'), circles)
