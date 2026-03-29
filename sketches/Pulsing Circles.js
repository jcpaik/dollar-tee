// Concentric circles pulsing to the beat
const circles = range({i: {from: 11, to: 0, n: 12}})
  .mapWith(({i}) => {
    const beat = $beats[i % 8]
    return { pulse: beat.active ? beat.ease("outCubic") : 0 }
  })
  .map(({i, pulse}) => [
    Fill(Color.hsl($time * 30 + i * 25, 100, 40 + pulse * 80, 1)),
    Circle(0, 0, lerp(20, min($width,$height) * 0.45, i / 12) * (1.6 + 0.3 * pulse)),
  ])

render(Background('#0a0a1a'), circles)
